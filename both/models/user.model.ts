import { Meteor } from 'meteor/meteor';
import { Store } from './store.model';
 
export interface User extends Meteor.User {
  stores?: Store[];
}