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

function loggedIn() {
  return !!Meteor.user();
}

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

Users.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});