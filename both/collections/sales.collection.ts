import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Sale } from '../models/sale.model';

export const Sales = new MongoObservable.Collection<Sale>('sales');
export const salesStatus = ['started','submitted','reserved','canceled'];
export const formOfPayment = ['cash','card','account'];

export const salesStatusMapping = {
    'started': 'En Proceso', 
    'submitted': 'Finalizada', 
    'reserved': 'Mercadera Reservada o Señada', 
    'canceled': 'Cancelada'
  };

export const salePaymentMapping = {
    'card': 'Contado', 
    'cash': 'Tarjeta', 
    'account': 'Cuenta', 
  };

function loggedIn() {
  return !!Meteor.user();
}
 
Sales.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});