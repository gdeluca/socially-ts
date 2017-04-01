import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

// collections
import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { Products } from '../../../both/collections/products.collection';
import { Purchases, purchasesStatusMapping } from '../../../both/collections/purchases.collection';
import { Stocks } from '../../../both/collections/stocks.collection';

// // model 
import { ProductPurchase } from '../../../both/models/product-purchase.model';
import { ProductSize } from '../../../both/models/product-size.model';
import { ProductPrice } from '../../../both/models/product-price.model';
import { Product } from '../../../both/models/product.model';
import { Purchase } from '../../../both/models/purchase.model';
import { Stock } from '../../../both/models/stock.model';

const purchaseFields = ['purchaseState', 'createdAt', 'lastUpdate', 'provider'];

Meteor.publishComposite('purchases', function(
  options: SearchOptions, 
  filters: Filters
) {
  let purchaseSelector = getSelectorFilter(purchaseFields, filters);
  checkOptions(options);
  return {
    find: function() { 
      Counts.publish(this, 'numberOfPurchases', 
        Purchases.collection.find(purchaseSelector), { noReady: true });
      return Purchases.collection.find(purchaseSelector, options);
    }
  }
});

Meteor.publishComposite('purchase-orders', function(
  purchaseNumber: number
) {
  check(purchaseNumber, Number);
  return {
    find: function() {
      return Purchases.collection.find(
        { purchaseNumber: purchaseNumber });
    },
    children: [
      {
        find: function(purchase) {
          return ProductPurchases.collection.find(
            { purchaseId: purchase._id });
        },
        children: [
          {
            find: function(productPurchase) {
              return ProductSizes.collection.find(
                { _id: productPurchase.productSizeId });
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
      }
    ]
  }
});
