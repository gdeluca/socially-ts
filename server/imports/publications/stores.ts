import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

import { Stores } from '../../../both/collections/stores.collection';
import { Store } from '../../../both/models/store.model';
import { UserStore } from '../../../both/models/user-store.model';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { User } from '../../../both/models/user.model';
import { Users } from '../../../both/collections/users.collection';

const storesFields = ['name','address'];

Meteor.publishComposite('stores', function() {
  return {
    find: function() {
      return Stores.collection.find({},{sort: {name: 1}});
    }
  }
});
 
Meteor.publishComposite('stores.users', function(
  userId: string
) {
  check(userId, String);
  return {
    find: function() {
      return UserStores.collection.find({ userId: userId })
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

Meteor.publishComposite('paginated.stores', function(
  options: SearchOptions, 
  filters: Filters
) {
  let storesSelector = getSelectorFilter(storesFields, filters);
  checkOptions(options);
  return {
    find: function() {
      Counts.publish(this, 'numberOfStores',
        Stores.collection.find(storesSelector), { noReady: true });
      return Stores.collection.find(storesSelector, options);
    }
  }
});