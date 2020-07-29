import { IConfig, IConfigInbound, IConfigOutbound, IConfigRouting } from '@typing/config.interface';
import { app } from 'electron';
import { EventEmitter } from 'events';
import { existsSync, mkdirSync, pathExists, readFile, writeFile } from 'fs-extra';
import * as Path from 'path';

export class AppConfig extends EventEmitter {
  public configPath: string;
  public nodeListPath: string;
  public routingConfigPath: string;
  public inboundsConfigPath: string;
  public runningConfigPath: string;

  constructor() {
    super();
    this.configPath = Path.resolve(app.getPath('appData'), 'v2ray-ng');
    if (!existsSync(this.configPath)) {
      mkdirSync(this.configPath);
    }
    this.nodeListPath = Path.resolve(this.configPath, 'node-list.json');
    this.routingConfigPath = Path.resolve(this.configPath, 'routing-config.json');
    this.routingConfigPath = Path.resolve(this.configPath, 'inbounds-config.json');
    this.runningConfigPath = Path.resolve(this.configPath, 'running-config.json');
  }

  public async getNodeConfigList() {
    const hasConfig = await pathExists(this.nodeListPath);
    if (!hasConfig) {
      return [];
    } else {
      const res = await readFile(Path.resolve(this.configPath, 'node-list.json'));
      return JSON.parse(res.toString());
    }
  }

  public async addNodeConfig(nodeConfig: IConfigOutbound) {
    const hasConfig = await pathExists(this.nodeListPath);
    if (!hasConfig) {
      await writeFile(this.nodeListPath, JSON.stringify([]));
    }
    const nodeList: IConfigOutbound[] = JSON.parse((await readFile(this.nodeListPath)).toString());
    nodeList.push({ ...nodeConfig, tag: `${Date.now()}${Math.round(Math.random() * 10000000)}` });
    await writeFile(this.nodeListPath, JSON.stringify(nodeList, null, 2));
  }

  public async updateNodeConfig(nodeConfig: IConfigOutbound) {
    const nodeList: IConfigOutbound[] = JSON.parse((await readFile(this.nodeListPath)).toString());
    const newNodeList = nodeList.map((node) => (node.tag === nodeConfig.tag ? nodeConfig : node));
    await writeFile(this.nodeListPath, JSON.stringify(newNodeList, null, 2));
  }

  public async getRoutingConfig(): Promise<IConfigRouting> {
    const hasConfig = await pathExists(this.routingConfigPath);
    if (!hasConfig) {
      return { domainStrategy: 'IPIfNonMatch', rules: [] };
    } else {
      const res = await readFile(this.routingConfigPath);
      return JSON.parse(res.toString());
    }
  }

  public async setRoutingConfig(routingConfig: IConfigRouting) {
    await writeFile(this.routingConfigPath, JSON.stringify(routingConfig, null, 2));
  }

  public async getInboundsConfig(): Promise<IConfigInbound[]> {
    const hasConfig = await pathExists(this.inboundsConfigPath);
    if (!hasConfig) {
      return [
        {
          tag: 'socks-inbound',
          protocol: 'socks',
          listen: '127.0.0.1',
          port: 1080,
          settings: { udp: true, ip: '127.0.0.1' },
        },
        {
          tag: 'http(s)-inbound',
          protocol: 'http',
          listen: '127.0.0.1',
          port: 1087,
          sniffing: { enabled: true, destOverride: ['http', 'tls'] },
        },
      ];
    } else {
      const res = await readFile(this.inboundsConfigPath);
      return JSON.parse(res.toString());
    }
  }

  public async setInboundsConfig(inboundsConfig: IConfigInbound[]) {
    await writeFile(this.inboundsConfigPath, JSON.stringify(inboundsConfig, null, 2));
  }

  public async setRunningConfig(node: IConfigOutbound): Promise<IConfig> {
    const routing = await this.getRoutingConfig();
    const inbounds = await this.getInboundsConfig();
    const config: IConfig = {
      log: { loglevel: 'debug' },
      inbounds,
      routing,
      outbounds: [
        { ...node, tag: 'proxy' },
        {
          protocol: 'freedom',
          tag: 'direct',
          settings: {
            domainStrategy: 'UseIP',
          },
        },
        { protocol: 'dns', tag: 'dns-out' },
        {
          tag: 'block',
          protocol: 'blackhole',
          settings: {
            response: {
              type: 'http',
            },
          },
        },
      ],
    };
    await writeFile(this.runningConfigPath, JSON.stringify(config, null, 2));
    return config;
  }
}
