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

  updateProductPrices: function (
    productId: string, 
    costPrice: number,
    cashPrices: number,
    cardPrices: number
  ) {
    check(productId, String);
    let query = {};
    if(costPrice != null) {
      check(costPrice, Number);
      query['lastCostPrice'] = costPrice;
    }
    if(cashPrices != null) {
      check(cashPrices, Number);
      query['priceCash'] = cashPrices;
    }
    if(cardPrices != null) {
      check(cardPrices, Number);
      query['priceCard'] = cardPrices;
    }

    if (Meteor.isServer) { 
      return ProductPrices.update(
        {productId:productId }, {
          $set: query
        }
      );
    }
  }

});
