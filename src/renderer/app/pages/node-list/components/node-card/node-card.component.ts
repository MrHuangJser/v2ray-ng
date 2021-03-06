import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UtilsService } from '@renderer/commons/services/utils.service';
import { IConfigOutbound } from '@typing/config.interface';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'v2ray-node-card',
  templateUrl: './node-card.component.html',
  styleUrls: ['./node-card.component.less'],
})
export class NodeCardComponent {
  @Input() public activated = false;
  @Input() public nodeConfig: IConfigOutbound;
  @Input() public showEdit = true;
  @Output() public vEdit = new EventEmitter<IConfigOutbound>();
  @Output() public vDelete = new EventEmitter<IConfigOutbound>();
  @Output() public vSelect = new EventEmitter<IConfigOutbound>();

  constructor(public utilsSrv: UtilsService, private modalSrv: NzModalService) {}

  emitEdit(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.vEdit.emit(this.nodeConfig);
  }

  emitDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.modalSrv.confirm({
      nzTitle: '警告',
      nzContent: '确认删除吗？',
      nzOnOk: () => this.vDelete.emit(this.nodeConfig),
    });
  }

  @HostListener('click')
  select() {
    this.vSelect.emit(this.nodeConfig);
  }

  getAddress(nodeConfig: IConfigOutbound) {
    return `${this.utilsSrv?.getConfigByProtocol(nodeConfig)?.address}:${
      this.utilsSrv?.getConfigByProtocol(nodeConfig)?.port
    }`;
  }
}
