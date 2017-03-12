import { Meteor } from 'meteor/meteor';

import { Counts } from 'meteor/tmeasday:publish-counts';

import { Products } from '../../../both/collections/products.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
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

Meteor.publishComposite('productByName', function(productName) {
return {
    find: function() {
        return Products.collection.find({ name: productName })
    }, 
    children: [{
        find: function(product) {
            return Categories.collection.find({_id: product.categoryId});
        }
    }]
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

Meteor.publishComposite('products.categories', function(options: SearchOptions, filterField?: string, filterValue?: string) {
  let query = {}
  
  if (filterField && filterValue) {
    const searchRegEx = { '$regex': '.*' + ([filterValue] || '') + '.*', '$options': 'i' };
    query = { [filterField]: searchRegEx }
  } 
  return {
    find: function() {
    Counts.publish(this, 'numberOfProducts',Products.collection.find(query , options), { noReady: true });
    return Products.collection.find(query, options);
    },
    children: [{
      find: function(product) {
        return Categories.collection.find({_id: product.categoryId});
      }
    }]
  }
});

const productFields = ['code','name','color','provider','categoryId'];
const productSizeFields = ['barCode','size'];


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

function getSelectorFilter(filterFields:string[], filters: any) {
  let selectors: any[] = new Array();
  let result: any = {};

  for (let filter of filterFields) {

    if (filterFields.indexOf(filter) > -1 && filters[filter]) {

      if (typeof filters[filter] === 'string') {
        selectors.push({ [filter]: { $regex: '.*' + (filters[filter] || '') + '.*', $options: 'i' }});
      }
      if (typeof filters[filter] === 'numeric') {
        
      }
    } 
  }
 
  // workarround: join doesn't work 
  if (selectors.length > 0) {
    if (selectors.length == 1) {
      result = selectors[0];
    } else if (selectors.length == 2) {
       result =  { $and: [  selectors[0], selectors[1] ] };
    } else if (selectors.length == 3) {
       result =  { $and: [  selectors[0], selectors[1], selectors[2] ] };
    }
  }
  //result = { $and: [ {"name":{$regex:".*v.*",$options:"i"}}, {"size":{"$regex":".*s.*",$options:"i"}} ] }
  // result = {"name":{"$regex":"*"}}

  return result;
}