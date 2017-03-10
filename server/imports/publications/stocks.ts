import { Meteor } from 'meteor/meteor';

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


import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../both/search/search-options';

const stockFields = ['cost', 'cashPayment', 'cardPayment'];
const productFields = ['code','name','color','provider','categoryId'];
const productSizeFields = ['barCode','size'];
const categoryFields = ['sectionId'];


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


