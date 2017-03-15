import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';
import { Product } from '../models/product.model';



Meteor.methods({

  saveProduct: function (product: Product) {
    check(product.name, String);
    check(product.code, String);
    check(product.color, String);
    check(product.brand, String);
    check(product.model, String);
    check(product.provider, String);
    check(product.categoryId, String);

    return Products.insert(product);
  },

  updateProduct: function (selector: string, product: Product) {
    check(selector, String);
    check(product.name, String);
    check(product.code, String);
    check(product.color, String);
    check(product.brand, String);
    check(product.model, String);
    check(product.provider, String);
    check(product.categoryId, String);

    return Products.update(product);
  }


 
});
