import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import {check} from 'meteor/check';
import * as _ from 'underscore';

import { getSelectorFilter, checkOptions } from '../../../both/domain/selectors';
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
const productFields = ['code','name','color','model','provider','categoryId'];
const productSizeFields = ['barCode','size'];
const categoryFields = ['sectionId'];

Meteor.publish('stocks', function(
  options: SearchOptions
) {
  checkOptions(options);
  return Stocks.find({}, options);
});

// Meteor.publish('productsizes.test', function(
//   options: SearchOptions,
//   filters: Filters,
//   fields: string[],
//   filter = {}
// ) {
//   checkOptions(options);
//   check(filter, Match.Any);
//   let selector = getSelectorFilter(fields, filters, filter);
//   Counts.publish(this, 'numberOfProductSizes', 
//     ProductSizes.collection.find({}), { noReady: true });
//   console.log(selector, options);
//   return ProductSizes.collection.find(selector, options);
// });

// Meteor.publish('stocks.test', function(
//   filters: Filters,
//   fields: string[],
//   filter = {}
// ) {
//   check(filter, Match.Any);
//   let selector = getSelectorFilter(fields, filters, filter);
//   return Stocks.collection.find(selector);
// });

// Meteor.publish('products.test', function(
//   filters: Filters,
//   fields: string[],
//   filter = {}
// ) {
//   check(filter, Match.Any);
//   let selector = getSelectorFilter(fields, filters, filter);
//     // console.log(JSON.stringify(selector));

//   return Products.collection.find(selector);
// });

// Meteor.publish('productprices.test', function(
//   filters: Filters,
//   fields: string[],
//   filter = {}
// ) {
//   check(filter, Match.Any);
//   let selector = getSelectorFilter(fields, filters, filter);
//   return ProductPrices.collection.find(selector);
// });

// Meteor.publish('categories.test', function(
//   filters: Filters,
//   fields: string[],
//   filter = {}
// ) {
//   check(filter, Match.Any);
//   let selector = getSelectorFilter(fields, filters, filter);
//   return Categories.collection.find(selector);
// });

// Meteor.publish('stores.test', function(
//   filters: Filters,
//   fields: string[],
//   filter = {}
// ) { 
//   check(filter, Match.Any);
//   let selector = getSelectorFilter(fields, filters, filter);
//   return Stores.collection.find(selector);
// });

// ----------------------------------------------------

Meteor.publishComposite('productsize.stock', function(
  options: SearchOptions, 
  filters: Filters
) {
  let productPriceFilter = getSelectorFilter(productPriceFields, filters);
  let productFilter = getSelectorFilter(productFields, filters);
  let productSizeFilter = getSelectorFilter(productSizeFields, filters);
  let categoryFilter = getSelectorFilter(categoryFields, filters);

  checkOptions(options);
  return {
    find: function() { 
      Counts.publish(this, 'numberOfProductSizes', 
        ProductSizes.collection.find(productSizeFilter), { noReady: true });
      return ProductSizes.collection.find(productSizeFilter, options);
    },
    children: [
      {
        find: function(productSize) {
          return Stocks.collection.find(
            { productSizeId: productSize._id }
          );
        }
      }, 
      {
        find: function(productSize) {
          let selector = getSelectorFilter(
            productFields, 
            filters,
            { _id: productSize.productId }
          );
          return Products.collection.find(selector);
        },
        children: [
          {
            find: function(product) {
              let selector = getSelectorFilter(
                productPriceFields, 
                filters,
                { productId: product._id }
              );
              return ProductPrices.collection.find(selector);
            },
            children: [
              {
                find: function(productPrice) {
                  return Stores.collection.find({ _id: productPrice.storeId });
                },
                children: [
                  {
                    find: function(store, productSize) {

                      let selector = getSelectorFilter(
                        [], 
                        filters,
                        [ 
                          {productSizeId: productSize._id},
                          {storeId: store._id},
                          {active: true }
                        ]
                      );
                      return Stocks.collection.find(selector);
                    }
                  } 
                ]
              } 
            ]
          },
          {
            find: function(product) {
              let selector = getSelectorFilter(
                categoryFields, 
                filters,
                { _id: product.categoryId }
              );
              return Categories.collection.find(selector)
            }
          }
        ]
      }
    ]
  }
});

Meteor.publish('product.stocks', function(
  productSizeIds: string[],
  storeIds: string[]
) {
  check(productSizeIds, [String]);
  check(storeIds, [String]);
  return Stocks.find(
    { $and: 
      [ 
        {productSizeId: {$in: productSizeIds }},
        {storeId: {$in: storeIds }},
        {active: true }
      ]
    }
  );
});


Meteor.publishComposite('product.price.size', function(
  options: SearchOptions, 
  filters: Filters
) {
 
  checkOptions(options);
    let selector1 = getSelectorFilter(
      productSizeFields, 
      filters
    );
    Counts.publish(this, 'numberOfProductSizes', 
      ProductSizes.collection.find(selector1), { noReady: true });

   
  return {
    find: function() {
      let selector = getSelectorFilter(
        [], 
        filters, 
        {}
      );
      return Stores.collection.find();
    },
    children: [
      {
        find: function(store) {
          let selector = getSelectorFilter(
            productPriceFields, 
            filters, 
            { storeId: store._id }
          );
          return ProductPrices.collection.find(selector);
        }
      }, 
      {
        find: function(productPrice) {
          let selector = getSelectorFilter(
            categoryFields, 
            filters
          );
          let categories =  Categories.collection.find(selector)
          selector = getSelectorFilter(
            productFields, 
            filters, 
            { categoryId: {$in: _.pluck(categories.fetch(), '_id') }}
          );
          return Products.collection.find(selector);
        },
        children: [
          {
            find: function(product) {
              let selector = getSelectorFilter(
                productSizeFields, 
                filters, 
                { productId: product._id }
              );
              return ProductSizes.collection.find(selector, options);
            }
          },
        ]
      }
    ]
  }
});

// Meteor.publish('productsizes', function(
//   options: SearchOptions
// ) {
//   checkOptions(options);
//   Counts.publish(this, 'numberOfProductSizes', 
//     ProductSizes.collection.find(selector), { noReady: true });
//   return Stocks.find({}, options);
// });