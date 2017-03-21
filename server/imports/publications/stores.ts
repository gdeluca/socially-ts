import { Meteor } from 'meteor/meteor';
import { } from 'meteor-publish-composite';

import { Stores } from '../../../both/collections/stores.collection';
import { Store } from '../../../both/models/store.model';
import { UserStore } from '../../../both/models/user-store.model';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { User } from '../../../both/models/user.model';
import { Users } from '../../../both/collections/users.collection';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../both/search/search-options';
import { getSelectorFilter } from './commons';


Meteor.publishComposite('stores', function() {
  return {
    find: function() {
      return Stores.collection.find( {}, {sort: {name: 1}} );
    }
  }
});
 
Meteor.publishComposite('stores.users', function(user_id: string) {
 return {
    find: function() {
        return UserStores.collection.find({ userId: user_id })
    }, 
    children: [
      {
          find: function(userStore) {
              return Stores.collection.find({_id: userStore.storeId});
          }
      }
    ]
  }
});

Meteor.publishComposite('stores.useremail', function(email: string) {
 return {
    find: function() { 
      return Users.collection.find({'emails.address': email});
    },
    children: [
      {
        find: function(user) {
            return UserStores.collection.find({ userId: user._id})
        },
        children: [
          {
            find: function(userStore) {
                return Stores.collection.find({_id: userStore.storeId});
            }
          }
        ]
      }
    ]
  }
});

const storesFilters = ['name','address'];

Meteor.publishComposite('stores-paginated', function(options: SearchOptions, filters: any) {
  
  let storesSelector = getSelectorFilter(storesFilters, filters);

  return {
    find: function() {
      Counts.publish(this, 'numberOfStores',Stores.collection.find(), { noReady: true });
      return Stores.collection.find(storesSelector, options);
    }
  }
});