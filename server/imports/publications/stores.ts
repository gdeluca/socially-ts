import { Meteor } from 'meteor/meteor';
import { Stores } from '../../../both/collections/stores.collection';
import { Store } from '../../../both/models/store.model';
import { UserStore } from '../../../both/models/user-store.model';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { User } from '../../../both/models/user.model';
import { Users } from '../../../both/collections/users.collection';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../both/search/search-options';


Meteor.publishComposite('stores', function() {
  return {
    find: function() {
      return Stores.collection.find({});
    }
  }
});
 
Meteor.publishComposite('stores.users', function(user_id: string) {
 return {
    find: function() {
        return UserStores.collection.find({ userId: user_id })
    }, 
    children: [{
        find: function(userStore) {
            return Stores.collection.find({_id: userStore.storeId});
        }
    }]
  }
});

Meteor.publishComposite('stores.useremail', function(email: string) {
 return {
    find: function() { 
      return Users.collection.find({'emails.address': email});
    },
    children: [{
      find: function(user) {
          return UserStores.collection.find({ userId: user._id})
      },
      children: [{
        find: function(userStore) {
            return Stores.collection.find({_id: userStore.storeId});
        }
      }]
    }]
  }
});

Meteor.publishComposite('stores.with.counter', function(options: SearchOptions, filterField?: string, filterValue?: string) {
  let query = {}
  
  if (filterField && filterValue) {
    const searchRegEx = { '$regex': '.*' + ([filterValue] || '') + '.*', '$options': 'i' };
    query = { [filterField]: searchRegEx }
  }
  return {
    find: function() {
    Counts.publish(this, 'numberOfStores',Stores.collection.find(query , options), { noReady: true });
    return Stores.collection.find(query, options);
    }
  }
});