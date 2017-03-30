import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
 
export const Users = MongoObservable.fromExisting(Meteor.users);

export const roles = ['administrator','supervisor','seller','anonymous'];

export const rolesMapping = {
  'administrator': 'Administrador', 
  'supervisor': 'Supervisor',
  'seller': 'Vendedor',
  'anonymous': 'Usuario'
};

// Meteor.users.deny({
//   update: function() {
//     return true;
//   }
// });

function loggedIn() {
  return !!Meteor.user();
}

// Users.allow({
//   insert: loggedIn,
//   update: loggedIn,
//   remove: loggedIn
// });

Meteor.users.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});