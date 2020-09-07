import { IConfigOutbound, ISubscribeConfig } from '@typing/config.interface';
import { createCanvas, loadImage } from 'canvas';
import { Menu, MenuItemConstructorOptions, nativeImage, nativeTheme, shell, Tray } from 'electron';
import { macOS } from 'electron-is';
import log from 'electron-log';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import * as Path from 'path';

export class AppTray extends EventEmitter {
  public tray?: Tray;
  constructor() {
    super();
    this.init();
  }

  init() {
    this.getTrayImage(0, 0).then((image) => {
      this.tray = new Tray(image);
      this.updateTrayContextMenu();
    });
  }

  updateTrayContextMenu() {
    this.getTrayContextMenus().then((menu) => {
      this.tray.setContextMenu(menu);
    });
  }

  async getTrayContextMenus(): Promise<Menu> {
    const { config, core } = global.appInstance;
    const localNodeList = await config.getConfigByPath(config.nodeListPath, [] as IConfigOutbound[]);
    const subscribeList = await config.getConfigByPath(config.subscribesConfigPath, [] as ISubscribeConfig[]);
    const { extensionMode, enabled } = await config.getGuiConfig(['extensionMode', 'enabled']);
    const activated = await global.appInstance.config.getActivatedNode();
    return Menu.buildFromTemplate([
      {
        label: '开启v2ray',
        type: 'checkbox',
        checked: enabled,
        click: (ev) => {
          config.setGuiConfig({ enabled: ev.checked });
          if (ev.checked) {
            core.start();
          } else {
            core.stop();
          }
        },
      },
      {
        label: '节点选择',
        submenu: [
          ...localNodeList.map<MenuItemConstructorOptions>((node) => ({
            label: node.name,
            type: 'radio',
            checked: node.tag === (activated && activated.nodeTag),
            click: () => {
              global.appInstance.config.setRunningConfig(node).then();
            },
          })),
          { type: 'separator' },
          ...subscribeList.map((sub) => ({
            label: sub.title,
            submenu: sub.nodes.map<MenuItemConstructorOptions>((node) => ({
              label: node.name,
              type: 'radio',
              checked: node.tag === (activated && activated.nodeTag),
              click: () => {
                global.appInstance.config.setRunningConfig(node).then();
              },
            })),
          })),
        ],
      },
      { label: '增强模式', checked: extensionMode, type: 'checkbox' },
      { type: 'separator' },
      {
        label: '控制面板',
        click: () => {
          global.appInstance.showMainPanel();
        },
      },
      {
        label: '打开配置文件夹',
        click: () => {
          shell.openPath(global.appInstance.config.configPath);
        },
      },
      {
        label: '查看日志',
        click: () => {
          shell.openPath(log.transports.file.getFile().path);
        },
      },
      { label: '退出', role: 'quit' },
    ]);
  }

  async getTrayImage(upload: number, download: number) {
    if (macOS()) {
      if (nativeTheme.shouldUseDarkColors) {
        return nativeImage.createFromBuffer(fs.readFileSync(Path.resolve(__dirname, './assets/dog-dark.png')), {
          scaleFactor: 8.5,
        });
      } else {
        return nativeImage.createFromBuffer(fs.readFileSync(Path.resolve(__dirname, './assets/dog-light.png')), {
          scaleFactor: 8.5,
        });
      }
    }
    return nativeImage.createFromBuffer(fs.readFileSync(Path.resolve(__dirname, './assets/dog-colorful.png')), {
      scaleFactor: 8.5,
    });
  }

  formatSpeedText(speed: number) {
    if (speed < 1024) {
      return `${Math.round(speed)} KB/s`;
    } else {
      return `${Math.round((speed / 1024) * Math.pow(10, 2)) / Math.pow(10, 2)}MB/s`;
    }
  }

  async getMacOSTrayImage(imgUrl: string, upload: number, download: number, isDark: boolean) {
    const canvas = createCanvas(300, 96);
    const ctx = canvas.getContext('2d');
    const image = await loadImage(imgUrl);
    ctx.drawImage(image, 0, 0, 200, 200, 5, 0, 96, 96);
    ctx.beginPath();
    ctx.fillStyle = isDark ? '#ffffff' : '#333';
    ctx.font = '590 35px ".SF Display"';
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(this.formatSpeedText(upload), 290, 15);
    ctx.fillText(this.formatSpeedText(download), 290, 55);
    ctx.closePath();
    return nativeImage.createFromBuffer(canvas.toBuffer(), { scaleFactor: 4 });
  }

  updateTrayImage(upload: number, download: number) {
    if (macOS()) {
      this.getTrayImage(upload, download).then((image) => {
        this.tray.setImage(image);
      });
    }
  }
}
