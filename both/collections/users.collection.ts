import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
 
export const Users = MongoObservable.fromExisting(Meteor.users);

// Meteor.users.deny({
//   update: function() {
//     return true;
//   }
// });

function loggedIn() {
  return !!Meteor.user();
}

Users.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
