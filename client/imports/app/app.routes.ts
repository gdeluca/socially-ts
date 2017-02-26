import { Meteor } from 'meteor/meteor';
import { Route } from '@angular/router';

import { StockLoadComponent } from './stock/stock-load.component';
import { StockListComponent } from './stock/stock-list.component';
import { OrdersComponent } from './sales/orders.component';
import { OrderDetailsComponent } from './sales/order-details.component'; 
import { PartiesListComponent } from './parties/parties-list.component';
import { PartyDetailsComponent } from './parties/party-details.component';
import { SectionsComponent } from './sections/sections.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/product-details.component';
import { LoginComponent } from './auth/login.component';
import { SignupComponent } from './auth/signup.component';

 
export const routes: Route[] = [
  { path: '', redirectTo: '/products', pathMatch: 'full', canActivate: ['canActivateForLoggedIn'] },
  { path: 'stock/create', component: StockLoadComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'stock', component: StockListComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'orders', component: OrdersComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'orders/:orderId', component: OrderDetailsComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'parties', component: PartiesListComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'party/:partyId', component: PartyDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'products', component: ProductsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'categories', component: CategoriesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'sections', component: SectionsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'product/:productId', component: ProductDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },


]; 

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}];