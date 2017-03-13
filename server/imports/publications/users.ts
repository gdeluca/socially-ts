import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { SearchOptions } from '../../../both/search/search-options';
 
import { Parties } from '../../../both/collections/parties.collection';
import { Users } from '../../../both/collections/users.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { Stores } from '../../../both/collections/stores.collection';

import { UserStore } from '../../../both/models/user-store.model';
import { Store } from '../../../both/models/store.model';
import { User } from '../../../both/models/user.model';
 

Meteor.publishComposite('user.byEmail', function(email: string) {
  return {
    find: function() {
      return Users.collection.find({"emails" : { $elemMatch: { "address" : email}}});
    }
  }
});
 
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
 
Meteor.publishComposite('users.stores', function(options: SearchOptions, filterField?: string, filterValue?: string) {
  let query = {}
  
  if (filterField && filterValue) {
    const searchRegEx = { '$regex': '.*' + ([filterValue] || '') + '.*', '$options': 'i' };
    query = { [filterField]: searchRegEx }
  }
  return {
    find: function() {
      Counts.publish(this, 'numberOfUsers',Users.collection.find(query , options), { noReady: true });
      return Users.collection.find(query, options);
    },
    children: [{
      find: function(user: User) {
        return UserStores.collection.find({userId: user._id});
      },
      children: [{
        find: function(userStore: UserStore) {
          return Stores.collection.find({_id: userStore.storeId});
        }
      }] 
    }]
  }
}); 