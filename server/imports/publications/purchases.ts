import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';

import { getSelectorFilter } from './commons';

// collections
// import { Counters } from '../../../both/collections/counters.collection';
import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { Products } from '../../../both/collections/products.collection';
import { Purchases, purchasesStatusMapping } from '../../../both/collections/purchases.collection';
import { Sales, salesStatusMapping, salePaymentMapping, workShiftMapping } from '../../../both/collections/sales.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Tags } from '../../../both/collections/tags.collection';
import { Users } from '../../../both/collections/users.collection';

// model 
// import { Counter } from '../../../both/models/counter.model';
import { ProductPurchase } from '../../../both/models/product-purchase.model';
import { ProductSale } from '../../../both/models/product-sale.model';
import { ProductSize } from '../../../both/models/product-size.model';
import { ProductPrice } from '../../../both/models/product-price.model';
import { Product } from '../../../both/models/product.model';
import { Purchase } from '../../../both/models/purchase.model';
import { Stock } from '../../../both/models/stock.model';
import { Tag } from '../../../both/models/tag.model';
import { User } from '../../../both/models/user.model';


import { SearchOptions } from '../../../both/search/search-options';

const purchaseFilters = ['purchaseState', 'purchaseDate', 'lastUpdate', 'provider'];

Meteor.publishComposite('purchases', function(options: SearchOptions, filters: any) {
  let purchaseSelector = getSelectorFilter(purchaseFilters, filters);
  return {
    find: function() { 
      Counts.publish(this, 'numberOfPurchases', Purchases.collection.find(purchaseSelector , options), { noReady: true });
      return Purchases.collection.find(purchaseSelector, options);
    }
  }
});

Meteor.publishComposite('purchase-orders', function(purchaseNumber: string) {
  return {
    find: function() {
      return Purchases.collection.find({ purchaseNumber: purchaseNumber });
    },
    children: [
      {
        find: function(purchase) {
          return ProductPurchases.collection.find({ purchaseId: purchase._id });
        },
        children: [
          {
            find: function(productPurchase) {
              return ProductSizes.collection.find({ _id: productPurchase.productSizeId });
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
      }
    ]
  }
});
