import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { ProductPrice } from '../models/product-price.model';




Meteor.methods({

  savePricesForStores: function (productPrice: ProductPrice, storeIds: string[]) {
    check(storeIds, [String]);
    return storeIds.map((storeId) => {
      productPrice['storeId'] = storeId;
      return ProductPrices.collection.insert(productPrice);
    })
  },

  addProductPrice: function (
    lastCostPrice: number,
    priceCash: number,
    priceCard: number,
    productId:string,
    storeId: string,
    rateCash?: number,
    rateCard?: number
  ) {
    check(lastCostPrice, Number);
    check(priceCash, Number);
    check(priceCard, Number);
    check(productId, String);
    check(storeId, String);
    if (Meteor.isServer)  {
      let query: ProductPrice;
      if(lastCostPrice != null) {
        query['lastCostPrice'] = lastCostPrice;
      }
      if(priceCash != null) {
        query['priceCash'] = priceCash;
      }
      if(priceCard != null) {
        query['priceCard'] = priceCard;
      }
      if(productId != null) {
        query['productId'] = productId;
      }
      if(storeId != null){
        query['storeId'] = storeId;
      }
      if(rateCash != null) {
        query['rateCash'] = rateCash;
      }
      if(rateCard != null) {
        query['rateCard'] = rateCard;
      }
   
       return ProductPrices.insert(query);
      // ProductPrices.insert(
      //   {
      //     lastCostPrice:lastCostPrice,
      //     priceCash:priceCash,
      //     priceCard:priceCard,
      //     productId:productId,
      //     storeId:storeId

      //   }
      // );
    }
  },

});
