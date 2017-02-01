import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
 
import { Invoice } from '../models/invoice.model';

export const Invoices = new MongoObservable.Collection<Invoice>('invoice');

function loggedIn() {
  return !!Meteor.user();
}
 
Invoices.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});