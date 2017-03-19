import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { DemoComponent } from "./demo/demo.component";
import { DemoDataService } from "./demo/demo-data.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { MomentModule } from 'angular2-moment';
import { Ng2PaginationModule } from 'ng2-pagination';
import { MultiselectDropdownModule } from '../modules/multiselect';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';


import { AppComponent } from './app.component';
import { routes, ROUTES_PROVIDERS } from './app.routes';


// project definitions, module inport order matters
import { AUTH_DECLARATIONS } from "./auth";
import { BALANCES_DECLARATIONS } from './balances';
import { CATEGORIES_DECLARATIONS } from './categories';
import { NAVBAR_DECLARATIONS } from './navbar';
import { PURCHASES_DECLARATIONS } from './purchases';
import { PRODUCTS_DECLARATIONS } from './products';
import { SALES_DECLARATIONS } from './sales';
import { SECTIONS_DECLARATIONS } from './sections';
import { SHARED_DECLARATIONS } from './shared';
import { STOCKS_DECLARATIONS } from './stock';
import { STORES_DECLARATIONS } from './stores';
import { USERS_DECLARATIONS } from './users';

import { FocusDirective } from '../directives/focus.directive';


@NgModule({
  // Components, Pipes, Directive
  declarations: [
    AppComponent,
    DemoComponent,
    FocusDirective,

    ...BALANCES_DECLARATIONS,
    ...STOCKS_DECLARATIONS,
    ...SALES_DECLARATIONS,
    ...PURCHASES_DECLARATIONS,
    ...PRODUCTS_DECLARATIONS,
    ...CATEGORIES_DECLARATIONS,
    ...SECTIONS_DECLARATIONS,
    ...STORES_DECLARATIONS,
    ...USERS_DECLARATIONS,
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
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AccountsModule,
    Ng2PaginationModule,
    Ng2AutoCompleteModule,
    MomentModule,
    MultiselectDropdownModule,
  ],
  
  // Main Component
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor() {}
}
