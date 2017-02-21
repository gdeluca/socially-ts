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

// project definitions, order matters
import { SALES_DECLARATIONS } from './sales';
import { PARTIES_DECLARATIONS } from './parties';
import { PRODUCTS_DECLARATIONS } from './products';
import { SHARED_DECLARATIONS } from './shared';
import { NAVBAR_DECLARATIONS } from './navbar';
import { AUTH_DECLARATIONS } from "./auth/index";

import { FocusDirective } from '../directives/focus.directive';


@NgModule({
  // Components, Pipes, Directive
  declarations: [
    AppComponent,
    DemoComponent,
    FocusDirective,
    ...SALES_DECLARATIONS,
    ...PARTIES_DECLARATIONS,
    ...PRODUCTS_DECLARATIONS,
    ...SHARED_DECLARATIONS,
    ...NAVBAR_DECLARATIONS,
    ...AUTH_DECLARATIONS,    
    
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
