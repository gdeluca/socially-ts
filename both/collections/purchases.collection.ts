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

Purchases.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Purchases.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});