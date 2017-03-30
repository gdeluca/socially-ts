import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';
 
import { Users } from '../../../both/collections/users.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { Stores } from '../../../both/collections/stores.collection';

import { UserStore } from '../../../both/models/user-store.model';
import { Store } from '../../../both/models/store.model';
import { User } from '../../../both/models/user.model';


const userFields = ['name', 'username', 'email'];

Meteor.publish('users', function(
  options: SearchOptions, 
  filters: Filters
) {
  let filterSelector = getSelectorFilter(userFields, filters);
  Counts.publish(this, 'numberOfUsers', 
    Users.collection.find(filterSelector), { noReady: true });
  return Users.collection.find(filterSelector, options);
}); 

Meteor.publishComposite('users.stores', function(
  options: SearchOptions, 
  filters: Filters
) {
  let selector = getSelectorFilter(userFields, filters);
  checkOptions(options);
  return {
    find: function() {
      Counts.publish(this, 'numberOfUsers',
        Users.collection.find(selector), { noReady: true });
        options["password"] = 0;
      return Users.collection.find(selector, options);
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

Meteor.publishComposite('user.stores', function(
  email: string, 
  username: string
) {
  check(email, String);
  check(username, String);
  return {
    find: function() { 
      return Users.collection.find(
        {'emails.address': email, username: username}, 
        {fields: {password: 0}}
      );
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
