import { Meteor } from 'meteor/meteor';
import { Route } from '@angular/router';

import { CategoriesComponent } from './categories/categories.component';
import { BalancesComponent } from './balances/balances.component';
import { LoginComponent } from './auth/login.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { PurchaseOrderComponent } from './purchases/purchase-order.component'; 
import { ProductsComponent } from './products/products.component';
import { SalesComponent } from './sales/sales.component';
import { SaleOrderComponent } from './sales/sale-order.component'; 
import { TagsComponent } from './tags/tags.component';
import { SignupComponent } from './auth/signup.component';
import { StockListComponent } from './stock/stock-list.component';
import { StoresComponent } from './stores/stores.component';
import { UsersComponent } from './users/users.component';

   
export const routes: Route[] = [
  { path: '', redirectTo: '/products', pathMatch: 'full', canActivate: ['canActivateForLoggedIn'] },
  { path: 'balances', component: BalancesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'categories', component: CategoriesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'login', component: LoginComponent },
  { path: 'purchases', component: PurchasesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'purchases/:orderNumber', component: PurchaseOrderComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'products', component: ProductsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'sales', component: SalesComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'sales/:orderNumber', component: SaleOrderComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'tags', component: TagsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'stock', component: StockListComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'signup', component: SignupComponent },
  { path: 'stores', component: StoresComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'users', component: UsersComponent, canActivate: ['canActivateForLoggedIn'] },

]; 

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}]; 