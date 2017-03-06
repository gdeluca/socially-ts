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
import { SearchOptions } from '../../both/search/search-options';

Meteor.publishComposite('stocks', function() {
 return {
    find: function() { 
      return Stocks.collection.find({});
    },
    children: [
      {
        find: function(stock) {
            return Stores.collection.find({ _id: stock.storeId})
        }
      },
      {
        find: function(stock) {
            return ProductSizes.collection.find({_id: stock.productSizeId});
        },
        children: [{
          find: function(productSize) {
            return Products.collection.find({_id: productSize.productId});
          }
        }]
      }
    ],
  }
});