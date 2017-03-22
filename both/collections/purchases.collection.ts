import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Purchase } from '../models/purchase.model';

export const Purchases = new MongoObservable.Collection<Purchase>('purchases');
export const purchaseStatus = ['SELECTION','VERIFICATION','ASIGNATION','FINISHED','CANCELED'];

export const purchasesStatusMapping = {
    'SELECTION': 'Seleccion de articulos', 
    'VERIFICATION': 'Verificacion de stock',
    'ASIGNATION': 'Distribucion del stock',
    'FINISHED': 'Finalizada', 
    'CANCELED': 'Cancelada' // only can be canceled on verification.
  };

function loggedIn() {
  return !!Meteor.user();
}
 
Purchases.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

