import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { } from 'meteor-publish-composite';
import {check} from 'meteor/check';

import { getSelectorFilter, checkOptions } from './commons';
import { SearchOptions } from '../../../both/domain/search-options';
import { Filter, Filters } from '../../../both/domain/filter';

import { Products } from '../../../both/collections/products.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
import { Categories } from '../../../both/collections/categories.collection';


const productFields = ['code','name','brand','color','provider','model'];
const productSizeFields = ['barCode','size']; 
const categoryFields = ['sectionId'];

Meteor.publishComposite('provider-products', 
  function(
    provider: string, 
    options: SearchOptions, 
    filters: Filters)
{
  check(provider, String);
  let productFilter = getSelectorFilter(productFields, filters);
  let selector: any = {};
  selector["$and"] = [];
  selector["$and"].push({ provider: provider });
  selector["$and"].push(productFilter);
  return {
    find: function() {
      Counts.publish(this, 'numberOfProducts',
        Products.collection.find(selector), { noReady: true });
      return Products.collection.find(selector, options)
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

Meteor.publishComposite('products.categories', function(
  options: SearchOptions, 
  filters: Filters
) {

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
          let selector: any = {};
          selector["$and"] = [];
          selector["$and"].push({ _id: product._id });
          selector["$and"].push(categorySelector);
          return Categories.collection.find(selector)
        }
      }
    ]
  }
});

Meteor.publishComposite('products-search', function(
  options: SearchOptions, 
  filters: Filters
) {
  let productSelector = getSelectorFilter(productFields, filters);
  let productSizeSelector = getSelectorFilter(productSizeFields, filters);
  checkOptions(options);
  return {
    find: function() {
      Counts.publish(this, 'numberOfProducts',
        Products.collection.find(productSelector), { noReady: true });
      return Products.collection.find(productSelector, options);
    },
    children: [
      {
        find: function(product) {
          let selector: any = {};
          selector["$and"] = [];
          selector["$and"].push({ productId: product._id });
          selector["$and"].push(productSizeSelector);
          return ProductSizes.collection.find(selector)
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
