import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { Sales } from '../collections/sales.collection';
import { ProductPrices } from '../collections/product-prices.collection';
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


function getCurrentDate(){
  return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
}

function getWorkShift(date){
  return (moment(date).format("HH") > "6" && moment(date).format("HH") < "13")?"MORNING":"AFTERNOON"; 
}

Meteor.methods({

  createSaleOrder(
    userStoreId:string,
    balanceId:string
  ): number {
    check(userStoreId, String);
    //check(balanceId, String);

    let result:number;
    MeteorObservable.call('getNextId', 'SALE')
    .subscribe(
      (orderNumber: number) => { 
        Sales.insert({
          saleNumber: orderNumber,
          saleState: 'STARTED',
          payment: '',
          saleDate:  getCurrentDate(),
          lastUpdate: getCurrentDate(),
          workShift: getWorkShift(new Date()),
          userStoreId: userStoreId,
          // balanceId: balanceId,
          balanceId: "10",
          discount: 0,
          taxes: 0,
          subtotal: 0,
          total: 0
        })
        result = orderNumber;
      }, (error) => { 
      }
    ); 
    return result;
  },
  
  updateSaleOrderStatus: function (saleId: string, newState: string) {
    check(saleId, String);
    check(newState, String);
    Sales.update(saleId, {
      $set: { 
        saleState: newState,
      }
    }
  )},

});
