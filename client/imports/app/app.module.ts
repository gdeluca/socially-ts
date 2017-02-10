import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { DemoComponent } from "./demo/demo.component";
import { DemoDataService } from "./demo/demo-data.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { Ng2PaginationModule } from 'ng2-pagination';

import { AppComponent } from './app.component';
import { routes, ROUTES_PROVIDERS } from './app.routes';

// project definitions
import { PARTIES_DECLARATIONS } from './parties';
import { SHARED_DECLARATIONS } from './shared';
import { NAVBAR_DECLARATIONS } from './navbar';
import { PRODUCTS_DECLARATIONS } from './products';


import { FocusDirective } from '../directives/focus.directive';


@NgModule({
  // Components, Pipes, Directive
  declarations: [
    AppComponent,
    DemoComponent,
    FocusDirective,
    ...PARTIES_DECLARATIONS,
    ...SHARED_DECLARATIONS,
    ...NAVBAR_DECLARATIONS,
    ...PRODUCTS_DECLARATIONS,
    
  ],

  // Entry Components
  entryComponents: [
    AppComponent,
  ],
  
  // Providers
  providers: [
    DemoDataService,
    ...ROUTES_PROVIDERS,
  ],
  
  // Modules
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AccountsModule,
    Ng2PaginationModule,
  ],
  
  // Main Component
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor() {}
}
