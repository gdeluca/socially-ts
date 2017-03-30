import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products, productTagNames } from '../collections/products.collection';
import { Tags } from '../collections/tags.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';

import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { Tag } from '../models/tag.model';

function generateProductCode(product: Product): string {
  let productTagDef = productTagNames;
  let code = "";
  for (let tagType of productTagNames) {
    console.log({type: tagType, description: product[tagType]}, {fields: {code: 1}});
    let tag = Tags.findOne({type: tagType, description: product[tagType]}, {fields: {code: 1}});
    code += ""+tag.code;
  }

  console.log(code);
  return code;
}

Meteor.methods({

  saveProduct: function (product: Product) {
    check(product, {
      name: String,
      color: String,
      brand: String,
      model: String,
      provider: String,
      categoryId: String,
    });
    product.name = product.name.toUpperCase();
    product.color = product.color.toUpperCase();
    product.brand = product.brand.toUpperCase();
    product.model = product.model.toUpperCase();
    product.provider = product.provider.toUpperCase();

    if (Meteor.isServer) { 
      // add tags on product if they are missed
      let productTagDef = productTagNames;
      productTagDef.forEach((tag) => {
        Meteor.call("addTag",
          tag, 
          product[tag]
        );
      });
      product.code = generateProductCode(product);
      return Products.collection.insert(product);
    }
  },

  updateProduct: function (
    selector: string, 
    product: Product
  ) {
    console.log(product);
    check(selector, String);
    // TODO: consistency may break if a property change 
    // given the static code related
    check(product, {
      _id: Match.Maybe(String),
      name: Match.Maybe(String),
      //code: Match.Maybe(String),
      color: Match.Maybe(String),
      brand: Match.Maybe(String),
      model: Match.Maybe(String),
      provider: Match.Maybe(String),
      categoryId: Match.Maybe(String),
    });
    let query = {};
    if(product.name != null) {
      product.name = product.name.toUpperCase();
    }
    if(product.color != null) {
      product.color = product.color.toUpperCase();
    }
    if(product.brand != null) {
      product.brand = product.brand.toUpperCase();
    }
    if(product.model != null) {
      product.model = product.model.toUpperCase();
    }
    if(product.provider != null) {
      product.provider = product.provider.toUpperCase();
    }
    if (Meteor.isServer) { 
      // we cannot change the product code. Since it can have printed barcodes already
      // but we can change the description for a tag code with a warning message
      // this will change the description for all the product that have that code assigned
      return Products.update(selector, product);
    }
  },

  saveProductSizes: function (
    productId: string, 
    sizes: string[]
  ) {
    check(productId, String);
    check(sizes, [String]);
    if (Meteor.isServer) { 
      let ids = [];
      let product = Products.findOne({_id:productId}, {fields: {code: 1}});

      sizes.forEach((item, index) => {
        var productSize = { 
          productId: productId, 
          size: sizes[index], 
          barCode: product.code + getMappingSize(sizes[index]) 
        };
        ids.push(ProductSizes.collection.insert(productSize));
      });
      return ids;
    }
  }

 
});
