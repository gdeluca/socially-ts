import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { MongoObservable, MeteorObservable } from 'meteor-rxjs';

import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPurchases } from '../collections/product-purchases.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Purchases } from '../collections/purchases.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';

import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { ProductPurchase } from '../models/product-purchase.model';
import { ProductSize } from '../models/product-size.model';

import * as moment from 'moment';
import 'moment/locale/es';

Meteor.methods({
  
  updatePurchaseOrder: function (
    purchaseId?: string, 
    purchaseState?: string, 
    createdAt?: Date,
    lastUpdate?: Date,
    provider?:string,
    paymentAmount?:number,
    total?:number
  ) {
    if (Meteor.isServer)  {
      check(purchaseId, Match.Maybe(String));
      check(purchaseState, Match.Maybe(String));
      check(createdAt, Match.Maybe(Date));
      check(lastUpdate, Match.Maybe(Date));
      check(provider, Match.Maybe(String));
      check(paymentAmount, Match.Maybe(Number));
      check(total, Match.Maybe(Number));

      let purchase = Purchases.findOne(
       {_id: purchaseId}, {fields: {_id: 1}});
      
      if (!purchase) {
        throw new Meteor.Error('400', 
          'La orden a actualizar no existe');
      }

      let query = {};
      if(purchaseState != null) {
        query['purchaseState'] = purchaseState.toUpperCase();
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
    if (Meteor.isServer) {
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
    }
  }, 

  saveProductPurchase: function (
    purchaseId: string, 
    productId: string,
    productSizeId:string,
    cost: number,
    quantity:number,
    subtotal?: number
  ) {
    if (Meteor.isServer) {
      check(purchaseId, String);
      check(productId, String);
      check(productSizeId, String);
      check(cost, Number);
      check(quantity, Number);
      check(subtotal, Match.Maybe(Number));

      let productPurchase = ProductPurchases.findOne(
        {purchaseId: purchaseId, productSizeId: productSizeId}, {fields: {_id: 1}});
      
      let query = {};
      query['cost'] = cost;
      query['quantity'] = quantity;
      if(subtotal != null) {
        query['subtotal'] = subtotal;
      }  
      if (productPurchase) {
        ProductPurchases.update(productPurchase._id, {
          $set: { query }
        });
      } else {
        query['purchaseId'] = purchaseId;
        query['productSizeId'] = productSizeId;
        ProductPurchases.insert(<ProductPurchase>query);
      }
    }
  },

  updateProductPurchase: function ( 
    productPurchaseId: string, 
    cost?: number,
    quantity?:number,
    subtotal?: number
  ) {
    if (Meteor.isServer)  {
      check(productPurchaseId, String);
      check(cost, Match.Maybe(Number));
      check(quantity, Match.Maybe(Number));
      check(subtotal, Match.Maybe(Number));

      let productPurchase = ProductPurchases.findOne(
       {_id: productPurchaseId}, {fields: {_id: 1}});
      
      if (!productPurchase) {
        throw new Meteor.Error('400', 
          'No se encontro la entrada a actualizar en product purchase');
      }

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
      ProductPurchases.update(
        productPurchaseId, {
          $set: query
        }
      )
    }
  },

  addProductSizesPurchase: function (
    purchaseId: string, 
    productId: string
  ) {
    if (Meteor.isServer)  {
      check(purchaseId, String);
      check(productId, String);
      // constraint: product price will be the same for any store 
      let productPrice = ProductPrices.findOne(
        {productId: productId}, {fields: {cost: 1}});
      if (!productPrice) {
        throw new Meteor.Error('400', 
          'No se encontro el precio del producto');
      }

      let productSizes: ProductSize[] = 
        ProductSizes.collection.find(
          {productId: productId}).fetch();
      if (productSizes.length == 0) {
         throw new Meteor.Error('400', 
          'No se agrega porque no encontraron talles asociados al producto, \n actualize el producto en la solapa de productos');
      }
      for (let productSize of productSizes) {
        Meteor.call("saveProductPurchase",
          purchaseId, 
          productId, 
          productSize._id, 
          productPrice.cost, 
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
    if (Meteor.isServer)  {
      check(purchaseId, String);
      check(productSizeIds, [String]);
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
    productSizeId:string
  ) {
    if (Meteor.isServer) {
      check(purchaseId, String);
      check(productSizeId, String);
      ProductPurchases.remove({
        purchaseId: purchaseId,
        productSizeId: productSizeId
      }); 
    }
  },

  updatePurchaseOrderStatus: function (
    purchaseId: string, 
    newState: string
  ) {
    check(purchaseId, String);
    check(newState, String);
    if (Meteor.isServer) {
      Meteor.call("updatePurchaseOrder",
        purchaseId, 
        newState
      );
    }
  },

});
