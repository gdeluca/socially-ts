import { Meteor } from 'meteor/meteor';

import { Route } from '@angular/router';
 
import { PartiesListComponent } from './parties/parties-list.component';
import { PartyDetailsComponent } from './parties/party-details.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductDetailsComponent } from './products/product-details.component';
import { LoginComponent } from './auth/login.component';
import { SignupComponent } from './auth/signup.component';

 
export const routes: Route[] = [
  { path: '', redirectTo: '/products', pathMatch: 'full', canActivate: ['canActivateForLoggedIn'] },
  { path: 'parties', component: PartiesListComponent , canActivate: ['canActivateForLoggedIn'] },
  { path: 'party/:partyId', component: PartyDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'products', component: ProductListComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'product/:productId', component: ProductDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },


]; 

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}];