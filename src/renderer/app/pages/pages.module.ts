import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '@renderer/commons/commons.module';
import { TitleComponent } from '@renderer/layouts/title/title.component';
import { NgZorroModule } from '@renderer/ng-zorro.module';
import { HomeComponent } from './home/home.component';
import { InputFormComponent } from './input-form/input-form.component';
import { NodeCardComponent } from './node-list/components/node-card/node-card.component';
import { NodeConfigFormComponent } from './node-list/components/node-config-form/node-config-form.component';
import { NodeListComponent } from './node-list/node-list.component';
import { routes } from './pages.routing';
import { RoutingFormComponent } from './routing-form/routing-form.component';
import { AppSettingsComponent } from './settings/components/app-settings/app-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { SubscribeFormComponent } from './subscribe-list/subscribe-form/subscribe-form.component';
import { SubscribeListComponent } from './subscribe-list/subscribe-list.component';

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' }), CommonsModule, NgZorroModule],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    NodeListComponent,
    TitleComponent,
    NodeConfigFormComponent,
    NodeCardComponent,
    SettingsComponent,
    RoutingFormComponent,
    InputFormComponent,
    AppSettingsComponent,
    SubscribeListComponent,
    SubscribeFormComponent,
  ],
})
export class PagesModule {}
