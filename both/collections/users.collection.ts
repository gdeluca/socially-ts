import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
 
export const Users = MongoObservable.fromExisting(Meteor.users);

Meteor.users.deny({
  update: function() {
    return true;
  }
});