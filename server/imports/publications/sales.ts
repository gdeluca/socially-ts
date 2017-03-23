import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { getSelectorFilter } from './commons';
import { SearchOptions } from '../../../both/search/search-options';

// collections
// import { Balances } from '../../../both/collections/balances.collection';
// import { Categories } from '../../../both/collections/categories.collection';
// import { Counters } from '../../../both/collections/counters.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
// import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { ProductSales } from '../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { Products } from '../../../both/collections/products.collection';
// import { Purchases } from '../../../both/collections/purchases.collection';
import { Sales } from '../../../both/collections/sales.collection';
// import { Sections } from '../../../both/collections/sections.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
// import { Tags } from '../../../both/collections/tags.collection';
import { Users } from '../../../both/collections/users.collection';


Meteor.publishComposite('sale-orders', function(saleNumber: string, options: SearchOptions) {
  return {
    find: function() {
      return Sales.collection.find({ saleNumber: saleNumber }, options);
    },
    children: [
      {
        find: function(sale) {
          return ProductSales.collection.find({ saleId: sale._id });
        },
        children: [
          {
            find: function(productSale) {
              return ProductSizes.collection.find({ _id: productSale.productSizeId });
            },
            children: [
              {
                find: function(productSize) {
                  return Products.collection.find({ _id: productSize.productId });
                },
                children: [
                  { 
                    find: function(product) {
                      return ProductPrices.collection.find({ productId: product._id});
                    }
                  }
                ]
              },
              { 
                find: function(productSize) {
                  return Stocks.collection.find({ productSizeId: productSize._id});
                }
              }
            ]
          }
        ]
      },  
      {  
        find: function(sale) {
          return UserStores.collection.find({ _id: sale.userStoreId });
        },
        children: [
          {
            find: function(userStore) {
              return Stores.collection.find({ _id: userStore.storeId });
            }
          },
          {
            find: function(userStore) {
              return  Meteor.users.find({ _id: userStore.userId }, {fields: {username: 1}});
            }
          }
        ]
      }
    ]
  }
});

const saleFields = ['paymentForm', 'saleState', 'saleDate'];
const userFields = ['seller'];
const storeFields = ['name'];

Meteor.publishComposite('store-sales', function(
  options: SearchOptions, 
  filters: any, 
  balanceId: string,
  storeId: string
) {
  
  let salesFilter = getSelectorFilter(saleFields, filters);
  let usersFilter = getSelectorFilter(userFields, filters);
  let storesFilter = getSelectorFilter(storeFields, filters);

  return {
    find: function() {
      let storesSelector = {_id: storeId};
      return Stores.collection.find(storesSelector);
    },
    children: [
      {
        find: function(store) {
          return UserStores.collection.find({storeId: storeId});
        },
        children: [
          {
            find: function(userStore) {
              Counts.publish(this, 'numberOfSales',Sales.collection.find({} , options), { noReady: true });
              return Sales.collection.find({userStoreId: userStore._id});
            }
          }, 
          {
            find: function(userStore) {
              let usersSelector: any = {};
              usersSelector["$and"] = [];
              usersSelector["$and"].push({_id: userStore.userId});
              usersSelector["$and"].push(usersFilter);
              
              return  Meteor.users.find(
                usersSelector, 
                {fields: {username: 1}}
              );
            }
          }
        ]
      }
    ]
  }
});



// Meteor.publishComposite('sales-store', function(
//   options: SearchOptions, 
//   filters: any, 
//   storeId: string, 
//   balanceId?: string
// ) {
  
//   let salesFilter = getSelectorFilter(saleFields, filters);
//   let usersFilter = getSelectorFilter(userFields, filters);
//   let storesFilter = getSelectorFilter(storeFields, filters);

//   return {
//     find: function() {
//       let salesSelector: any = {};
//        salesSelector["$and"] = [];

//       // filter by balance
//       // uncomment this when balance integration is ready
//       // if (balanceId) {
//       //   salesSelector["$and"].push({balanceId: balanceId});      
//       // }
//       salesSelector["$and"].push(salesFilter);

//       Counts.publish(this, 'numberOfSales',Sales.collection.find(salesSelector , options), { noReady: true });
//       return Sales.collection.find(salesSelector, options);
//     },
//     children: [
//       {
//         find: function(sale) {
//           return UserStores.collection.find({_id: sale.userStoreId});
//         },
//         children: [
//           {
//             find: function(userStore) {
//               let storesSelector: any = {};
//               storesSelector["$and"] = [];
//               storesSelector["$and"].push({_id: userStore.storeId});
//               storesSelector["$and"].push(storesFilter);
//               return Stores.collection.find(storesSelector);
//             }
//           },
//           {
//             find: function(userStore, storeId) {
//               let usersSelector: any = {};
//                usersSelector["$and"] = [];
//               if (storeId) {
//                 usersSelector["$and"].push({storeId: userStore.userId});
//               }
//               usersSelector["$and"].push({_id: userStore.userId});
//               usersSelector["$and"].push(usersFilter);
              
//               return  Meteor.users.find(
//                 usersSelector, 
//                 {fields: {username: 1}}
//               );
//             }
//           }
//         ]
//       },
//       {
//         find: function(sale) {
//           return ProductSales.collection.find({saleId: sale._id});
//         }
//       }
//     ]
//   }
// });


