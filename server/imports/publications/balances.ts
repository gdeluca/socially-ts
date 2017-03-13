import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { getSelectorFilter } from './commons';
import { SearchOptions } from '../../../both/search/search-options';

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
// import { Sections } from '../../../both/collections/sections.collection';
// import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
// import { Tags } from '../../../both/collections/tags.collection';
// import { Users } from '../../../both/collections/users.collection';

const saleFields = ['saleDate', 'paymentForm', 'saleState'];
const userFields = ['seller'];

Meteor.publishComposite('balance-sales', function(options: SearchOptions, filters: any) {
  
  let salesSelector = getSelectorFilter(saleFields, filters);
  let usersSelector = getSelectorFilter(userFields, filters);

  return {
    find: function() {
      Counts.publish(this, 'numberOfBalances',Balances.collection.find({} , options), { noReady: true });
      return Balances.collection.find({});
    },
    children: [
      {
        find: function(balance) {
          return Sales.collection.find({ $and: [{ balanceId: balance._id }, salesSelector ]});
        },
        children: [
          {
            find: function(sale) {
               return UserStores.collection.find({ _id: sale.userStoreId });
            }
          },
          {
            find: function(userStore) {
              return  Meteor.users.find(
                { $and: [{ _id: userStore.userId }, usersSelector ]}, 
                { fields: {username: 1} }
              );
            }
          },
          {
            find: function(userStore) {
              return Stores.collection.find({ _id: userStore.storeId });
            }
          }
        ]
      }
    ]
  }
});


