import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';

import { getSelectorFilter } from './commons';

// collections
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Products } from '../../../both/collections/products.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Sections } from '../../../both/collections/sections.collection';
import { Stores } from '../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../both/models/product-size.model';
import { ProductPrice } from '../../../both/models/product-price.model';
import { Stock } from '../../../both/models/stock.model';
import { Product } from '../../../both/models/product.model';
import { Category } from '../../../both/models/category.model';
import { Section } from '../../../both/models/section.model';
import { Store } from '../../../both/models/store.model';

import { SearchOptions } from '../../../both/search/search-options';

const productPriceFields = ['cost', 'cashPayment', 'cardPayment'];
const productFields = ['code','name','color','provider','categoryId'];
const productSizeFields = ['barCode','size'];
const categoryFields = ['sectionId'];

Meteor.publish('allStocks', function(options: SearchOptions) { 
  return Stocks.find({}, options);
});

Meteor.publishComposite('productsSize-stock', function(options: SearchOptions, filters: any) {
  
  let productPriceSelector = getSelectorFilter(productPriceFields, filters);
  let productSelector = getSelectorFilter(productFields, filters);
  let productSizeSelector = getSelectorFilter(productSizeFields, filters);
  
  return {
    find: function() {
      Counts.publish(this, 'numberOfProductSizes',ProductSizes.collection.find({} , options), { noReady: true });
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
          return Products.collection.find({ $and: [{ _id: productSize.productId }, productSelector ] });
        },
        children: [
          {
            find: function(product) {
              return ProductPrices.collection.find({ $and: [{ productId: product._id }, productPriceSelector ] });
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
