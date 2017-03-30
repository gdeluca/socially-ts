import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPurchases } from '../collections/product-purchases.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Purchases } from '../collections/purchases.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { ProductSize } from '../models/product-size.model';

import * as moment from 'moment';
import 'moment/locale/es';
import { MongoObservable, MeteorObservable } from 'meteor-rxjs';


function getCurrentDate(){
  return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
}

Meteor.methods({

  updatePurchaseOrderStatus: function (
    purchaseId: string, 
    newState: string
  ) {
    check(purchaseId, String);
    check(newState, String);
    Purchases.update(purchaseId, {
      $set: { 
        purchaseState: newState,
      }
    }
  )},
  
  updatePurchaseOrder: function (
    purchaseId?: string, 
    purchaseState?: string, 
    createdAt?: string,
    lastUpdate?: string,
    provider?:string,
    paymentAmount?:number,
    total?:number
  ) {
    check(purchaseId, Match.Maybe(String));
    check(purchaseState, Match.Maybe(String));
    check(createdAt, Match.Maybe(String));
    check(lastUpdate, Match.Maybe(String));
    check(provider, Match.Maybe(String));
    check(paymentAmount, Match.Maybe(String));
    check(total, Match.Maybe(String));
    if (Meteor.isServer)  {
      let query = {};
      if(purchaseState != null) {
        query['purchaseState'] = purchaseState;
      }
      if(purchaseState != null) {
        query['purchaseState'] = purchaseState;
      }
      if(createdAt != null) {
        query['createdAt'] = createdAt;
      }
      if(lastUpdate != null) {
        query['lastUpdate'] = lastUpdate;
      }
      if(provider != null) {
        query['provider'] = provider.toUpperCase();
      }
      if(paymentAmount != null) {
        query['paymentAmount'] = paymentAmount;
      }
      if(total != null) {
        query['total'] = total;
      }
      Purchases.update(purchaseId, {
        $set: query
      });
    }
  },

  createPurchaseOrder(
    provider:string,
    storeId:string
  ):number {
    check(provider, String);
    check(storeId, String);
    let result:number;
    MeteorObservable.call('getNextId', 'PURCHASE', storeId)
    .subscribe(
      (orderNumber: number) => { 
        Purchases.insert({
          purchaseNumber: orderNumber,
          purchaseState: 'SELECTION', 
          createdAt:  new Date(),
          lastUpdate: new Date(),
          provider: provider.toUpperCase(),
          paymentAmount:0,
          total:0
        })
        result = orderNumber;
      }, (error) => { 
      }
    ); 
    return result;
  }, 

  saveProductPurchase: function (
    purchaseId: string, 
    productId: string,
    productSizeId:string,
    cost: number,
    quantity:number,
    subtotal?: number) {
    check(purchaseId, String);
    check(productId, String);
    check(productSizeId, String);
    check(cost, Number);
    check(quantity, Number);
    if (Meteor.isServer)  {
      let productPurchase = ProductPurchases.findOne(
        {purchaseId: purchaseId, productSizeId: productSizeId}
      );
        
      if (productPurchase) {
        ProductPurchases.update(productPurchase._id, {
          $set: { 
            productCost: cost,
            productQuantity: quantity,
            subtotal: subtotal
          }
        });
      } else {
        ProductPurchases.insert({
          purchaseId: purchaseId, 
          cost: cost,
          productSizeId: productSizeId,
          quantity: quantity,
          subtotal: subtotal
        })
      }
    }
  },

  updateProductPurchase: function ( 
    productPurchaseId: string, 
    cost?: number,
    quantity?:number,
    subtotal?: number
  ) {
    check(productPurchaseId, String);
    check(cost, Match.Maybe(String));
    check(quantity, Match.Maybe(String))
    check(subtotal, Match.Maybe(String));
    let query = {};
    if(cost != null) {
        query['cost'] = cost;
    }
    if(quantity != null) {
        query['quantity'] = quantity;
    }
    if(subtotal != null) {
        query['subtotal'] = subtotal;
    }
    if (Meteor.isServer)  {
      ProductPurchases.update(
        productPurchaseId, {
          $set: query
        }
      )
    }
  },

  saveProductSizesPurchase: function (
    purchaseId: string, 
    productId: string
  ) {
    check(purchaseId, String);
    check(productId, String);
    if (Meteor.isServer)  {
      // for now, get it from any store
      let productPrice = ProductPrices.findOne({productId: productId});

      let productSizes: ProductSize[] = ProductSizes.collection.find({productId: productId}).fetch();
      for (let productSize of productSizes) {
        Meteor.call("saveProductPurchase",
          purchaseId, 
          productId, 
          productSize._id, 
          +productPrice.lastCostPrice, 
          0, 
          0
        );
      }
    }
  },

  removeProductSizesPurchase: function (
    purchaseId: string, 
    productSizeIds:string[]
    ) {
    check(productSizeIds, [String]);
    if (Meteor.isServer)  {
      for (let productSizeId of productSizeIds) {
        Meteor.call("removeProductPurchase",
          purchaseId, 
          productSizeId
        );
      }
    }
  },

  removeProductPurchase: function (
    purchaseId: string, 
    productSizeId:string) {
    check(purchaseId, String);
    check(productSizeId, String);
    if (Meteor.isServer)  {
      ProductPurchases.remove(
        {
          purchaseId: purchaseId,
          productSizeId: productSizeId
        }); 
    }
  },

});
