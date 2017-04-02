import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { ProductPrice } from '../models/product-price.model';

Meteor.methods({

  savePricesForStores: function (
    productPrice: ProductPrice, 
    storeIds: string[]
  ) {
    if (Meteor.isServer) {
      check(storeIds, [String]);
      check(productPrice, {
        cost: Number,
        createdAt: Date,
        priceCash: Number,
        priceCard: Number,
        rateCash: Match.Maybe(Number),
        rateCard: Match.Maybe(Number),
        productId: String,
        storeId: String,
        active: Boolean
      });

      const rawCollection = ProductPrices.rawCollection();
      const bulk = rawCollection.initializeUnorderedBulkOp();
      storeIds.map((storeId) => {
        productPrice['storeId'] = storeId;
        productPrice['_id'] = Random.id(),
        bulk.insert(Object.assign({}, productPrice)); // clone it
      })
      bulk.execute(function(error, results) {
        if(error) {
          throw new Meteor.Error('400', 
            'Fallo al guardar precios de productos: ' + error);
        }
      });
 
    }
  },

  addProductPrice: function (
    cost: number,
    priceCash: number,
    priceCard: number,
    productId:string,
    storeId: string,
    rateCash?: number,
    rateCard?: number
  ) {
    if (Meteor.isServer)  {
      check(cost, Number);
      check(priceCash, Number);
      check(priceCard, Number);
      check(productId, String);
      check(storeId, String);
      check(rateCash, Match.Maybe(Number));
      check(rateCard, Match.Maybe(Number));
      
      let query = {};
      query['cost'] = cost;
      query['priceCash'] = priceCash;
      query['priceCard'] = priceCard;
      query['productId'] = productId;
      query['storeId'] = storeId;
      
      if(rateCash != null) {
        query['rateCash'] = rateCash;
      }
      if(rateCard != null) {
        query['rateCard'] = rateCard;
      }
   
       return ProductPrices.insert(<ProductPrice>query);
    }
  },

});
