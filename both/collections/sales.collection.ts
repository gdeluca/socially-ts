import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Sale } from '../models/sale.model';

export const Sales = new MongoObservable.Collection<Sale>('sales');
export const salesStatus = ['STARTED','SUBMITTED','RESERVED','CANCELED'];
export const formOfPayment = ['CASH','CARD','ACCOUNT'];

export const salesStatusMapping = {
    'STARTED': 'En Proceso', 
    'SUBMITTED': 'Finalizada', 
    'RESERVED': 'Reservado/Señado', 
    'CANCELED': 'Cancelada'
  };

export const salePaymentMapping = {
    'CARD': 'Contado', 
    'CASH': 'Tarjeta', 
    'ACCOUNT': 'Cuenta', 
  };

export const workShiftMapping = {
    'MORNING': 'Mañana', 
    'AFTERNOON': 'Tarde', 
  };

function loggedIn() {
  return !!Meteor.user();
}
 
Sales.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});