import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import { Balances } from '../collections/balances.collection';
import { Products } from '../collections/products.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { ProductSales } from '../collections/product-sales.collection';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { Sales } from '../collections/sales.collection';
import { Stores } from '../collections/stores.collection';

import { Store } from '../models/store.model';
import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { ProductSize } from '../models/product-size.model';

import * as moment from 'moment';
import 'moment/locale/es';
import { MongoObservable } from 'meteor-rxjs';
import { MeteorObservable } from 'meteor-rxjs';

function getWorkShift(date){
  return (moment(date).format("HH") > "6" && moment(date).format("HH") < "13")?"MORNING":"AFTERNOON"; 
}

Meteor.methods({

  createSaleOrder(
    userStoreId:string,
    balanceNumber:number,
    storeId:string
  ): number {
    if (Meteor.isServer) {
      check(userStoreId, String);
      check(balanceNumber, Number);
      check(storeId, String);
      let result: number;
      MeteorObservable.call(
        'getNextId', 
        'SALE', 
        storeId
      ).subscribe(
        (orderNumber: number) => { 
          let balance = Balances.findOne(
            { balanceNumber: balanceNumber, storeId:storeId }, 
            {fields: {_id: 1}});

          if (!balance) {
            // console.log('nº balance:' 
            //   + balanceNumber + ', storeId:' + storeId);
            throw new Meteor.Error('400', 
              'Intento de crear una venta sin un balance abierto');
          }
          Sales.insert({
            saleNumber: orderNumber,
            saleState: 'STARTED',
            payment: 'CASH', //Default payment method
            createdAt:  new Date(),
            lastUpdate: new Date(),
            workShift: getWorkShift(new Date()),
            userStoreId: userStoreId,
            balanceId: balance._id
          })
          result = orderNumber;
        }, (error) => { 
           throw new Meteor.Error('400', 
             'Fallo al crear un Nº de orden de venta');
        }
      ); 
    return result;
    }
  },
  
  updateSaleOrderStatus: function (
    saleId: string, 
    newState: string
  ) {
    check(saleId, String);
    check(newState, String);
    let sale:Sale  = Sales.findOne(
      {_id:saleId}, {fields: {_id: 1}});

    if (!sale) {
      throw new Meteor.Error('400', 
        'No existe la venta que se intenta actualizar');
    }

    if (newState !== 'CANCELED') {
      // check there is at least 1 product asociated 
      // for other status
      let anyProductSaleRelated = ProductSales.findOne(
        {saleId:saleId}, {fields: {_id: 1}});
      if (!anyProductSaleRelated) {
        throw new Meteor.Error('400', 'No hay productos cargados');
      }
    }
  
    let productsales = ProductSales.collection.find(
        {saleId: saleId}, {fields: {subTotal: 1}}).fetch();
    
    let total = 0;
    productsales.forEach(productsale => {
      total += productsale.subTotal;
    })

    Sales.update(saleId, {
      $set: { 
        saleState: newState,
        lastUpdate: new Date(),
        total: +total
      }
    }
  )},

});
