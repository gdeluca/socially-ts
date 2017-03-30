import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

// collections
import { Balances } from '../../../both/collections/balances.collection';
// import { Categories } from '../../../both/collections/categories.collection';
// import { Counters } from '../../../both/collections/counters.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
// import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
// import { ProductSales } from '../../../both/collections/product-sales.collection';
// import { ProductSizes } from '../../../both/collections/product-sizes.collection';
// import { Products } from '../../../both/collections/products.collection';
// import { Purchases } from '../../../both/collections/purchases.collection';
import { Sales } from '../../../both/collections/sales.collection';
// import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
// import { Tags } from '../../../both/collections/tags.collection';
// import { Users } from '../../../both/collections/users.collection';

const saleFields = ['saleDate', 'paymentForm', 'saleState'];
const userFields = ['seller:name'];

Meteor.publishComposite('balances-sales', function(
  options: SearchOptions, 
  filters: Filters,
  balance: string,
) {
  
  let salesSelector = getSelectorFilter(saleFields, filters);
  let usersSelector = getSelectorFilter(userFields, filters);
  check(balance, String);
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
          let salesSelector: any = {};
          salesSelector["$and"] = [];
          salesSelector["$and"].push({ balanceId: balance._id });
          salesSelector["$and"].push(salesSelector);
          return Sales.collection.find(salesSelector);
        },
        children: [
          {
            find: function(sale) {
              return UserStores.collection.find({ _id: sale.userStoreId });
            },
            children: [
              {
                find: function(userStore, balance) {
                  return Stores.collection.find({ _id: userStore.storeId });
                }
              }
            ]
          }
        ]
      }
    ]
  }
});


