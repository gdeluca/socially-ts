import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

// collections
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Products } from '../../../both/collections/products.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Stores } from '../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../both/models/product-size.model';
import { ProductPrice } from '../../../both/models/product-price.model';
import { Stock } from '../../../both/models/stock.model';
import { Product } from '../../../both/models/product.model';
import { Category } from '../../../both/models/category.model';
import { Store } from '../../../both/models/store.model';

const productPriceFields = ['cost', 'cashPayment', 'cardPayment'];
const productFields = ['code','name','color','provider','categoryId'];
const productSizeFields = ['barCode','size'];
const categoryFields = ['sectionId'];

Meteor.publish('stocks', function(
  options: SearchOptions
) {
  checkOptions(options);
  return Stocks.find({}, options);
});

Meteor.publishComposite('productsize-stock', function(
  options: SearchOptions, 
  filters: Filters
) {
  let productPriceSelector = getSelectorFilter(productPriceFields, filters);
  let productSelector = getSelectorFilter(productFields, filters);
  let productSizeSelector = getSelectorFilter(productSizeFields, filters);
  checkOptions(options);
  return {
    find: function() { 
      Counts.publish(this, 'numberOfProductSizes', 
        ProductSizes.collection.find(productSizeSelector), { noReady: true });
      return ProductSizes.collection.find(productSizeSelector, options);
    },
    children: [
      {
        find: function(productSize) {
          return Stocks.collection.find({ productSizeId: productSize._id });
        }
      }, 
      {
        find: function(productSize) {
          let selector: any = {};
          selector["$and"] = [];
          selector["$and"].push({ _id: productSize.productId });
          selector["$and"].push(productSelector);
          return Products.collection.find(selector);
        },
        children: [
          {
            find: function(product) {
              let selector: any = {};
              selector["$and"] = [];
              selector["$and"].push({ productId: product._id });
              selector["$and"].push(productPriceSelector);
              return ProductPrices.collection.find(selector);
            },
            children: [
              {
                find: function(stock) {
                  return Stores.collection.find({ _id: stock.storeId });
                }
              } 
            ]
          }
        ]
      }
    ]
  }
});
