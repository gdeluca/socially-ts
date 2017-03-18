import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { Purchases } from '../collections/purchases.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';
import { Product } from '../models/product.model';



Meteor.methods({

  updatePurchaseOrderStatus: function (purchaseId: string, purchaseState: string) {
    check(purchaseId, String);
    check(purchaseState, String);
    Purchases.update(purchaseId, {
      $set: { 
        purchaseState: purchaseState,
      }
    }
  )},
    
});
