import { Meteor } from 'meteor/meteor';
import { Stores } from '../../../both/collections/stores.collection';
import { Store } from '../../../both/models/store.model';
import { UserStore } from '../../../both/models/user-store.model';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { User } from '../../../both/models/user.model';
import { Users } from '../../../both/collections/users.collection';

import { SearchOptions } from '../../../both/search/search-options';


Meteor.publish('stores', function() {
  return Stores.find({});
});

Meteor.publishComposite('stores.users', function(user_id: string) {
 return {
    find: function() {
        return UserStores.find({ userId: user_id })
    }, 
    children: [{
        find: function(userStore) {
            return Stores.find({_id: userStore.storeId});
        }
    }]
  }
});


Meteor.publishComposite('stores.useremail', function(email: string) {
 return {
    find: function() { 
      return Users.collection.find({'emails.address': 'b@b.com'});
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