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

function generateProductCode(
  product: Product
): string {
  let productTagDef = productTagNames;
  let code = "";
  for (let tagType of productTagNames) {
    console.log({type: tagType, description: product[tagType]}, {fields: {code: 1}});
    let tag = Tags.findOne({type: tagType, description: product[tagType]}, {fields: {code: 1}});
    code += ""+tag.code;
  }
  return code;
}

Meteor.methods({

  saveProduct: function (
    product: Product
  ) {
    if (Meteor.isServer) { 
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

  // TODO: consistency may break if a property change 
  // given the static code related
  // we cannot change the product code. Since it can have printed barcodes already
  // but we can change the description for a tag code with a warning message
  // this will change the description for all the product that have that code assigned
  updateProduct: function (
    productId: string,
    name: string,
    color: string,
    brand: string,
    model: string,
    provider: string,
    categoryId: string
  ) {
    if (Meteor.isServer) { 
      check(productId, String);

      check(name, Match.Maybe(String));
      check(color, Match.Maybe(String));
      check(brand, Match.Maybe(String));
      check(model, Match.Maybe(String));
      check(provider, Match.Maybe(String));
      check(categoryId, Match.Maybe(String));

      let product = Products.findOne(
        {_id:productId}, {fields: {_id: 1}});
      if (!product) {
        throw new Meteor.Error('400', 
          'No se encontro el producto a actualizar');
      }

      let query = {};
      if(name != null) {
        query['name'] = name.toUpperCase();
      }
      if(color != null) {
        query['color'] = color.toUpperCase();
      }
      if(brand != null) {
        query['brand'] = brand.toUpperCase();
      }
      if(model != null) {
        query['model'] = model.toUpperCase();
      }
      if(provider != null) {
        query['provider'] = provider.toUpperCase();
      }
      if(categoryId != null) {
        query['categoryId'] = categoryId;
      }

      return Products.update(productId, { $set: query });
    }
  },

  saveProductSizes: function (
    productId: string, 
    sizes: string[]
  ) {
    if (Meteor.isServer) { 
      check(productId, String);
      check(sizes, [String]);
      let ids = [];
      let product = Products.findOne(
        {_id:productId}, {fields: {code: 1}});

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
