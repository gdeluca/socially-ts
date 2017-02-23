import { Meteor } from 'meteor/meteor';
 
import { Parties } from '../../../both/collections/parties.collection';
import { Users } from '../../../both/collections/users.collection';


Meteor.publishComposite('user.byEmail', function(email: string) {
  return {
    find: function() {
      return Users.find({"emails" : { $elemMatch: { "address" : email}}});
    }, 
    children: [{
        find: function(product) {
        }
    }]
  }
});

/*Meteor.publish('user.byEmail', function(email: string) {
  return Users.find({"emails" : { $elemMatch: { "address" : email}}});  
});
*/
Meteor.publish('uninvited', function (partyId: string) {
  const party = Parties.findOne(partyId);
 
  if (!party) {
    throw new Meteor.Error('404', 'No such party!');
  }
  
  return Meteor.users.find({
    _id: {
      $nin: party.invited || [],
      $ne: this.userId
    }
  });
});