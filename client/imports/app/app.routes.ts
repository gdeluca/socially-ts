import { Meteor } from 'meteor/meteor';
import { Route } from '@angular/router';

import { PartiesListComponent } from './parties/parties-list.component';
import { PartyDetailsComponent } from './parties/party-details.component';

import { CategoriesComponent } from './categories/categories.component';
import { BalanceResumeComponent } from './balances/balance-resume.component';
import { LoginComponent } from './auth/login.component';
import { SaleDetailsComponent } from './sales/sale-details.component'; 
import { SalesComponent } from './sales/sales.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/product-details.component';
import { SectionsComponent } from './sections/sections.component';
import { SignupComponent } from './auth/signup.component';
import { StockLoadComponent } from './stock/stock-load.component';
import { StockListComponent } from './stock/stock-list.component';
import { StoresComponent } from './stores/stores.component';
import { UsersComponent } from './users/users.component';

 
export const routes: Route[] = [
  { path: '', redirectTo: '/sales/000001', pathMatch: 'full', canActivate: ['canActivateForLoggedIn'] },
  { path: 'balances', component: BalanceResumeComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'categories', component: CategoriesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'login', component: LoginComponent },
  { path: 'sales', component: SalesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'sales/:saleNumber', component: SaleDetailsComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'parties', component: PartiesListComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'party/:partyId', component: PartyDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'products', component: ProductsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'product/:productId', component: ProductDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'sections', component: SectionsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'stock', component: StockListComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'stock/create', component: StockLoadComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'signup', component: SignupComponent },
  { path: 'stores', component: StoresComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'users', component: UsersComponent, canActivate: ['canActivateForLoggedIn'] },


]; 

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}]; 