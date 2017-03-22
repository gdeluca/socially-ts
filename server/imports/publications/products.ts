import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { getSelectorFilter } from './commons';


import { Products } from '../../../both/collections/products.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { Categories } from '../../../both/collections/categories.collection';

import { SearchOptions } from '../../../both/search/search-options';

Meteor.publishComposite('productById', function(productId: string) {
 return { 
    find: function() {
        return Products.collection.find({ _id: productId })
    }, 
    children: [{
        find: function(product) {
            return Categories.collection.find({_id: product.categoryId});
        }
    }]
  }
});


const productFields = ['code','name','brand','color','provider','model'];
const productSizeFields = ['barCode','size']; 
const categoryFields = ['sectionId'];

Meteor.publishComposite('provider-products', function(provider, options: SearchOptions, filters: any) {

let productSelector = getSelectorFilter(productFields, filters);
let selector = { provider: provider };
return {
    find: function() {
        Counts.publish(this, 'numberOfProducts',Products.collection.find(selector), { noReady: true });
        return Products.collection.find({ $and: [selector, productSelector] })
    }, 
    children: [
      {
        find: function(product) {
            return ProductPrices.collection.find({productId: product._id});
        }
      }
    ]
  }
});
 
Meteor.publishComposite('products', function() {
return {
    find: function() {
        return Products.collection.find()
    }, 
    children: [{
        find: function(product) {
            return Categories.collection.find({_id: product.categoryId});
        }
    }]
  }
});

Meteor.publishComposite('products-with-categories', function(options: SearchOptions, filters: any) {

  let productSelector = getSelectorFilter(productFields, filters);
  let categorySelector = getSelectorFilter(['categoryName:name'], filters);

  return {
    find: function() {
      Counts.publish(this, 'numberOfProducts',Products.collection.find(productSelector , options), { noReady: true });
      return Products.collection.find(productSelector, options);
    },
    children: [
      {
        find: function(product) {
          return Categories.collection.find( { $and: [{ _id: product._id }, categorySelector ] })
        }
      }
    ]
  }
});



Meteor.publishComposite('products-search', function(options: SearchOptions, filters: any) {
  
  let productSelector = getSelectorFilter(productFields, filters);
  let productSizeSelector = getSelectorFilter(productSizeFields, filters);

  return {
    find: function() {
      Counts.publish(this, 'numberOfProducts',Products.collection.find(productSelector , options), { noReady: true });
      return Products.collection.find(productSelector, options);
    },
    children: [
      {
        find: function(product) {
          return ProductSizes.collection.find({ $and: [{ productId: product._id }, productSizeSelector ] })
        }
      },  
      {  
        find: function(product) {
          return Categories.collection.find({_id: product.categoryId})
        }
      }
    ]
  }
});
