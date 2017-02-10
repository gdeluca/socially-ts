import { Meteor } from 'meteor/meteor';

import { Route } from '@angular/router';
 
import { PartiesListComponent } from './parties/parties-list.component';
import { PartyDetailsComponent } from './parties/party-details.component';
import { ProductListComponent } from './products/product-list.component';
import { ProductDetailsComponent } from './products/product-details.component';

 
export const routes: Route[] = [
  { path: '', redirectTo: '/parties', pathMatch: 'full' },
  { path: 'parties', component: PartiesListComponent },
  { path: 'party/:partyId', component: PartyDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:productId', component: ProductDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  
]; 

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}];