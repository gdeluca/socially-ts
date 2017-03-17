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
  }

});
