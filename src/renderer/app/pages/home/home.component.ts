import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'v2ray-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  public menuCollapsed = false;
  constructor(private electronSrv: ElectronService) {}
  ngOnInit() {
    console.log(this.electronSrv.remote.getGlobal('process').env.HOME);
  }
}
