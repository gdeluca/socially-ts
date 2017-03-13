import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { getSelectorFilter } from './commons';

// collections
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Products } from '../../../both/collections/products.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Sections } from '../../../both/collections/sections.collection';
import { Stores } from '../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../both/models/product-size.model';
import { Stock } from '../../../both/models/stock.model';
import { Product } from '../../../both/models/product.model';
import { Category } from '../../../both/models/category.model';
import { Section } from '../../../both/models/section.model';
import { Store } from '../../../both/models/store.model';

import { SearchOptions } from '../../../both/search/search-options';

const stockFields = ['cost', 'cashPayment', 'cardPayment'];
const productFields = ['code','name','color','provider','categoryId'];
const productSizeFields = ['barCode','size'];
const categoryFields = ['sectionId'];

Meteor.publishComposite('stocks', function(options: SearchOptions, filters: any) {
  
  let stockSelector = getSelectorFilter(stockFields, filters);
  let productSelector = getSelectorFilter(productFields, filters);
  let productSizeSelector = getSelectorFilter(productSizeFields, filters);
  let categorySelector = getSelectorFilter(categoryFields, filters);
  
 return {
    find: function() { 
      Counts.publish(this, 'numberOfStocks',Stocks.collection.find(stockSelector , options), { noReady: true });
      return Stocks.collection.find(stockSelector, options);
    },
    children: [{
      find: function(stock) {
          return ProductSizes.collection.find({ $and: [{ _id: stock.productSizeId }, productSizeSelector ] });
      },
        children: [{
          find: function(productSize) {
            return Products.collection.find({ $and: [{ _id: productSize.productId }, productSelector ] })
          },
            children: [{
              find: function(product) {
                return Categories.collection.find({ $and: [{ _id: product.categoryId }, categorySelector ] })
              }
            }]
        }]
    }]
  }
});

Meteor.publish('allStocks', function(options: SearchOptions) { 
  return Stocks.find({}, options);
});
