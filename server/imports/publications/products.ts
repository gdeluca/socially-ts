import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import { Products } from '../../../both/collections/products.collection';
import { Categories } from '../../../both/collections/categories.collection';

import { SearchOptions } from '../../../both/search/search-options';

Meteor["publishComposite"]('productById', function(productId: string) {
 return {
    find: function() {
        return Products.find({ _id: productId })
    }, 
    children: [{
        find: function(product) {
            return Categories.find({_id: product.categoryId});
        }
    }]
  }
});

Meteor["publishComposite"]('productByName', function(productName) {
return {
    find: function() {
        return Products.find({ name: productName })
    }, 
    children: [{
        find: function(product) {
            return Categories.find({_id: product.categoryId});
        }
    }]
  }
});

Meteor["publishComposite"]('products', function() {
return {
    find: function() {
        return Products.find()
    }, 
    children: [{
        find: function(product) {
            return Categories.find({_id: product.categoryId});
        }
    }]
  }
});

Meteor.publishComposite('products.categories', function(options: SearchOptions, filterField?: string, filterValue?: string) {
  let query = {}
  
  if (filterField && filterValue) {
    const searchRegEx = { '$regex': '.*' + ([filterValue] || '') + '.*', '$options': 'i' };
    query = { [filterField]: searchRegEx }
  }
  return {
    find: function() {
    Counts.publish(this, 'numberOfProducts',Products.collection.find(query , options), { noReady: true });
    return Products.find(query, options);
    },
    children: [{
      find: function(product) {
        return Categories.find({_id: product.categoryId});
      }
    }]
  }
});