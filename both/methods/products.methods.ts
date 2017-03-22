import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products, productTagNames } from '../collections/products.collection';
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
    product.name = product.name.toUpperCase();
    product.color = product.color.toUpperCase();
    product.brand = product.brand.toUpperCase();
    product.model = product.model.toUpperCase();
    product.provider = product.provider.toUpperCase();

    if (Meteor.isServer) { 
      // add tags on product add if they are missed
      let productTagDef = productTagNames;
      productTagDef.forEach((tag) => {
        Meteor.call("addTag",
          tag, 
          product[tag]
        );
      });
      return Products.collection.insert(product);
    }
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
    product.name = product.name.toUpperCase();
    product.color = product.color.toUpperCase();
    product.brand = product.brand.toUpperCase();
    product.model = product.model.toUpperCase();
    product.provider = product.provider.toUpperCase();

    if (Meteor.isServer) { 
      return Products.update(selector, product);
    }
  },

  saveProductSizes: function (productId: string, productCode: string, sizes: string[]) {
    check(productId, String);
    check(productCode, String);
    check(sizes, [String]);
    if (Meteor.isServer) { 
      let ids = [];
      sizes.forEach((item, index) => {
        var productSize = { 
          productId: productId, 
          size: sizes[index], 
          barCode: productCode + getMappingSize(sizes[index]) 
        };
        ids.push(ProductSizes.collection.insert(productSize));
      });
      return ids;
    }
  }

 
});
