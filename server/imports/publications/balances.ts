import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

// collections
import { Balances } from '../../../both/collections/balances.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { Sales } from '../../../both/collections/sales.collection';
import { Stores } from '../../../both/collections/stores.collection';

const saleFields = ['createdAt', 'paymentForm', 'saleState'];
const userFields = ['seller:name'];

Meteor.publishComposite('balances-sales', function(
  options: SearchOptions, 
  filters: Filters,
) {
  
  let salesSelector = getSelectorFilter(saleFields, filters);
  let usersSelector = getSelectorFilter(userFields, filters);
  checkOptions(options);
  return {
    find: function() {
      Counts.publish(this, 'numberOfBalances',
        Balances.collection.find({}), { noReady: true });
      return Balances.collection.find({}, options); 
    },
    children: [
      {
        find: function(balance) {
          let selector: any = {};
          selector["$and"] = [];
          selector["$and"].push(salesSelector);
          selector["$and"].push({ balanceId: balance._id });
          return Sales.collection.find(selector);
        },
        children: [
          {
            find: function(sale) {
              return UserStores.collection.find(
                { _id: sale.userStoreId });
            },
            children: [
              {
                find: function(userStore) {
                  return Stores.collection.find(
                    { _id: userStore.storeId });
                }
              }
            ]
          }
        ]
      }
    ]
  }
});


