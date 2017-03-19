import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPurchases } from '../collections/product-purchases.collection';
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
  
  updatePurchaseOrder: function (
  purchaseId?: string, 
  purchaseState?: string, 
  purchaseDate?: string,
  lastUpdate?: string,
  provider?:string,
  paymentAmount?:number,
  total?:number
  ) {
    check(purchaseId, String);
    // check(purchaseState, String);
    // check(purchaseDate, String);
    // check(lastUpdate, String);
    // check(provider, String);
    // check(paymentAmount, Number);
    // check(total, Number);

    let query = {};
    if(purchaseState) {
      query['purchaseState'] = purchaseState;
    }
    if(purchaseState) {
      query['purchaseState'] = purchaseState;
    }
    if(purchaseDate) {
      query['purchaseDate'] = purchaseDate;
    }
    if(lastUpdate) {
      query['lastUpdate'] = lastUpdate;
    }
    if(provider) {
      query['provider'] = provider;
    }
    if(paymentAmount) {
      query['paymentAmount'] = paymentAmount;
    }
    if(total) {
      query['total'] = total;
    }
    if (Meteor.isServer)  {
      Purchases.update(purchaseId, {
        $set: query
      });
    }
  },

  createPurchaseOrder: function(
    purchaseNumber: string,
    purchaseState: string, 
    purchaseDate: string,
    lastUpdate: string,
    provider:string,
    paymentAmount:number,
    total?:number,
  ) {
    check(purchaseNumber, String);
    check(purchaseState, String);
    check(purchaseDate, String);
    check(lastUpdate, String);
    check(provider, String);
    check(paymentAmount, Number);
    check(total, Number);

    let purchase = Purchases.findOne(
      {purchaseNumber: purchaseNumber}
    );
       
    if (purchase) {
      Meteor.call("updatePurchaseOrder",
        purchase._id, 
        purchaseState,
        purchaseDate,
        lastUpdate,
        provider,
        paymentAmount,
        total
      );
    } else {
      Purchases.insert({
        purchaseNumber: purchaseNumber,
        purchaseState: purchaseState, 
        purchaseDate: purchaseDate,
        lastUpdate: lastUpdate,
        provider: provider,
        paymentAmount:paymentAmount,
        total:total
      })
    }
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
    check(cost, Number);
    check(productSizeId, String);
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

  saveProductSizesPurchase: function (
    purchaseId: string, 
    productId: string,
    productSizeIds:string[],
    cost: number,
    quantity:number,   
    subtotal?: number) {
    check(productSizeIds, [String]);
    if (Meteor.isServer)  {
      for (let productSizeId of productSizeIds) {
        Meteor.call("saveProductPurchase",
          purchaseId, 
          productId, 
          productSizeId, 
          cost, 
          quantity, 
          subtotal
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
