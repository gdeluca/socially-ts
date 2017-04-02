import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import { Balances } from '../collections/balances.collection';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { Sales } from '../collections/sales.collection';
import { ProductSales } from '../collections/product-sales.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';

import { Store } from '../models/store.model';
import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { ProductSize } from '../models/product-size.model';

import * as moment from 'moment';
import 'moment/locale/es';
import { MongoObservable } from 'meteor-rxjs';
import { MeteorObservable } from 'meteor-rxjs';


Meteor.methods({

  addProductToOrder(
    barcode: string,
    quantity: number,
    storeId: string,
    saleId: string
  ) {
    check(barcode, String);
    check(quantity, Number);
    check(storeId, String);
    check(saleId, String);

    if (Meteor.isServer) {
      if (barcode.length != 13) {
         throw new Meteor.Error('400', 
           'Longitud de Codigo de Barra invalida');
      }

      let productSize = ProductSizes.findOne(
        {barCode: barcode});

      if (!productSize) {
        throw new Meteor.Error('400', 
          'No existe el talle para el codigo de barras: ' + barcode
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
          + barcode + ' en la sucursal: ' + storeId
        );
      }

      if (stocks.length == 0) {
        throw new Meteor.Error('400', 
          'No existe stock activo del producto: '
          + barcode + ' en la sucursal: ' + storeId
        );
      }

      let stock = stocks[0];
      if (stock.quantity < quantity) {
        throw new Meteor.Error('400', 
          'La cantidad solicitada: ' + quantity 
          + 'es mayor a la disponible: ' + stock.quantity 
          +' del producto: ' + barcode + ' en la sucursal: ' + storeId
        );
      }

      let productSale = ProductSales.collection.find(
        {productSizeId: productSize._id, saleId: saleId}
      ).fetch()[0];

      // if found the update(increase the quantity)
      if (productSale) {
        ProductSales.update(
          {_id:productSale._id},
          {$set: {quantity : productSale.quantity + quantity}}
        );
      } else {
        // update the produstsale, add the new productsize
        ProductSales.insert({
          productSizeId: productSize._id, 
          saleId: saleId,
          quantity: quantity
        });
      }

      // update the stock, decrement the quantity field
      Stocks.update(
       {_id:stock._id},
       {$set: {quantity : stock.quantity - quantity}}
      );
    }
  },

});
