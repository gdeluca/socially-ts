import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products, productTagNames } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';

import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { ProductPrice } from '../models/product-price.model';

Meteor.methods({

  updateProductPrices: function (
    productId: string, 
    costPrice?: number,
    cashPrices?: number,
    cardPrices?: number
  ) {
    if (Meteor.isServer) { 
      check(productId, String);
      check(costPrice, Match.Maybe(Number));
      check(cashPrices, Match.Maybe(Number));
      check(cardPrices, Match.Maybe(Number));

      let query: ProductPrice;
      if(costPrice != null) {
        query['cost'] = costPrice;
      }
      if(cashPrices != null) {
        query['priceCash'] = cashPrices;
      }
      if(cardPrices != null) {
        query['priceCard'] = cardPrices;
      }

      let selector = { productId : productId, active: true }
      let productPrice = ProductPrices.findOne(
        {selector}, {fields: {_id: 1}});
      if (!productPrice) {
        throw new Meteor.Error('400', 
          'No se encontraron los precios del producto');
      }
      return ProductPrices.update(selector, {
        $set: query
      });
    }
  }

});
