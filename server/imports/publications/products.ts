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