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
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { ProductSales } from '../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { Products } from '../../../both/collections/products.collection';
import { Sales } from '../../../both/collections/sales.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
import { Users } from '../../../both/collections/users.collection';

const saleFields = ['paymentForm', 'saleState', 'saleDate'];
const userFields = ['seller'];
const storeFields = ['name'];

Meteor.publishComposite('sale-orders', function(
  saleNumber: number, 
  options: SearchOptions
) {
  check(saleNumber, Number);
  checkOptions(options);
  return {
    find: function() {
      let selector = {saleNumber: saleNumber};
      Counts.publish(this, 'numberOfOrders', 
        Sales.collection.find(selector), { noReady: true });
      return Sales.collection.find(selector, options);
    },
    children: [
      {
        find: function(sale) {
          return ProductSales.collection.find(
            { saleId: sale._id });
        },
        children: [
          {
            find: function(productSale) {
              return ProductSizes.collection.find(
                { _id: productSale.productSizeId });
            },
            children: [
              {
                find: function(productSize) {
                  return Products.collection.find(
                    { _id: productSize.productId });
                },
                children: [
                  { 
                    find: function(product) {
                      return ProductPrices.collection.find(
                        { productId: product._id});
                    }
                  }
                ]
              },
              { 
                find: function(productSize) {
                  return Stocks.collection.find(
                    { productSizeId: productSize._id});
                }
              }
            ]
          }
        ]
      },  
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
          },
          {
            find: function(userStore) {
              return  Meteor.users.find(
                { _id: userStore.userId }, {fields: {username: 1}});
            }
          }
        ]
      }
    ]
  }
});

Meteor.publishComposite('store-sales', function(
  options: SearchOptions, 
  filters: Filters,
  storeId: string,
  balanceNumber?: number,
) {
  check(storeId, String);
  check(balanceNumber, Match.Maybe(Number));
  let salesFilter = getSelectorFilter(saleFields, filters);
  let usersFilter = getSelectorFilter(userFields, filters);
  let storesFilter = getSelectorFilter(storeFields, filters);
  checkOptions(options);
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
              return Sales.collection.find({userStoreId: userStore._id});
            },
            children: [
              {
                find: function(sale) {
                  let selector = { _id : sale.balanceId };
                  if (balanceNumber) {
                    selector['balanceNumber'] = balanceNumber;
                  }
                  return Balances.collection.find(selector);
                }
              }
            ]
          }, 
          {
            find: function(userStore) {
              let selector: any = {};
              selector["$and"] = [];
              selector["$and"].push({_id: userStore.userId});
              selector["$and"].push(usersFilter);
              return  Meteor.users.find(
                selector, 
                {fields: {username: 1}}
              );
            }
          }
        ]
      }
    ]
  }
});
