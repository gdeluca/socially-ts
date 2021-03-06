import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import { Balances } from '../collections/balances.collection';
import { Sales } from '../collections/sales.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { ProductSales } from '../collections/product-sales.collection';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';

import { Store } from '../models/store.model';
import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { ProductSale } from '../models/product-sale.model';
import { ProductSize } from '../models/product-size.model';
import { ProductPrice } from '../models/product-price.model';


import * as moment from 'moment';
import 'moment/locale/es';
import { MongoObservable } from 'meteor-rxjs';
import { MeteorObservable } from 'meteor-rxjs';

function getPrice(paymentForm: string, productPrice: ProductPrice){
  switch (paymentForm) {
    case "CARD":
    case "ACCOUNT":
      return productPrice.priceCard;
    case "CASH":
    default:
      return productPrice.priceCash;
  }
}

Meteor.methods({

  removeFromSaleOrder(
    barCode: string,
    storeId: string,
    saleId: string
  ) {
    check(barCode, String);
    check(storeId, String);
    check(saleId, String);
    if (Meteor.isServer) {
      let productSize = ProductSizes.findOne(
        {barCode: barCode}, {fields: {_id: 1}});

      if (!productSize) {
        throw new Meteor.Error('400', 
          'No existe el talle para el codigo de barras: ' + barCode
        );
      }

      let selector = { productSizeId: productSize._id, saleId: saleId }
      let productsale = ProductSales.findOne(selector, {fields: {quantity: 1}});
       if (!productsale) {
        throw new Meteor.Error('400', 
          'El producto no esta en la lista: '
        );
      }

      let stock = Stocks.collection.find({
        productSizeId: productSize._id, 
        active:true, 
        storeId: storeId
      }).fetch()[0];
      
      // update the stock, increment the quantity field
      Stocks.update(
       {_id:stock._id},
       {$set: {quantity : stock.quantity + productsale.quantity}}
      );

      // remove element from list
      ProductSales.remove(selector);
    }
  },

  addToSaleOrder(
    barCode: string,
    quantity: number,
    storeId: string,
    saleId: string,
    paymentForm: string
  ) {
    check(barCode, String);
    check(quantity, Number);
    check(storeId, String);
    check(saleId, String);
    check(paymentForm, String);

    if (Meteor.isServer) {
      if (barCode.length != 13) {
         throw new Meteor.Error('400', 
           'Longitud de Codigo de Barra invalida');
      }

      let productSize = ProductSizes.findOne(
        {barCode: barCode}, {fields: {_id: 1, productId: 1}});

      if (!productSize) {
        throw new Meteor.Error('400', 
          'No existe el talle para el codigo de barras: ' + barCode
        );
      }
      let stocks = Stocks.collection.find({
        productSizeId: productSize._id, 
        active:true, 
        storeId: storeId
      }).fetch();

      if (stocks.length > 1) {
        throw new Meteor.Error('400', 
          'Stock del producto activo duplicado: '
          + barCode + ' en la sucursal: ' + storeId
        );
      }

      if (stocks.length == 0) {
        throw new Meteor.Error('400', 
          'No existe stock activo del producto: '
          + barCode + ' en la sucursal: ' + storeId
        );
      }

      let stock = stocks[0];
      if (stock.quantity < quantity) {
        throw new Meteor.Error('400', 
          'La cantidad solicitada: ' + quantity 
          + 'es mayor a la disponible: ' + stock.quantity 
          +' del producto: ' + barCode + ' en la sucursal: ' + storeId
        );
      }

      let productSale = ProductSales.collection.find(
        {productSizeId: productSize._id, saleId: saleId}
      ).fetch()[0];
 
      let productPrice = ProductPrices.findOne({productId: productSize.productId});
      if (!productPrice) {
        throw new Meteor.Error('400', 
          'No existe los precios para el producto: '
          + barCode
        );
      }
      let price = +getPrice(paymentForm, productPrice);
      let query = {};

      if (productSale) { // if found the update(increase the quantity)
        query['quantity'] = productSale.quantity + quantity;
        query['subTotal'] = +price * query['quantity'];
        ProductSales.update(
          {_id:productSale._id},
          { 
            $set: query
          }
        );
      } else {  // update the produstsale, add the new productsize
        query['productSizeId'] = productSize._id;
        query['saleId'] = saleId; 
        query['quantity'] = +quantity;
        query['subTotal'] = +price * query['quantity'];
        ProductSales.insert(<ProductSale>query);
      }

      // update the stock, decrement the quantity field
      Stocks.update(
        {_id:stock._id},
        { 
          $set: {
            quantity : stock.quantity - quantity
          }
        }
      );
    }
  },

});
