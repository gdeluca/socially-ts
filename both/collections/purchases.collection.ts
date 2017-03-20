import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Purchase } from '../models/purchase.model';

export const Purchases = new MongoObservable.Collection<Purchase>('purchases');
export const purchaseStatus = ['LOADED','REQUESTED','RECEIVED','CANCELED'];

export const purchasesStatusMapping = {
    'LOADED': 'Redactada', 
    'REQUESTED': 'Pedido relizado', 
    'RECEIVED': 'Pedido recibido', 
    'CANCELED': 'Cancelada' // only can be canceled a loaded order.
  };

function loggedIn() {
  return !!Meteor.user();
}
 
Purchases.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

