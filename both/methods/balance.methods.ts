import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
// import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
// import { ProductPurchases } from '../collections/product-purchases.collection';
// import { ProductPrices } from '../collections/product-prices.collection';
// import { Purchases } from '../collections/purchases.collection';
import { Balances } from '../collections/balances.collection';

// import { Products } from '../collections/products.collection';
// import { Stores } from '../collections/stores.collection';
// import { Stocks } from '../collections/stocks.collection';
// import { Store } from '../models/store.model';
// import { Product } from '../models/product.model';
import { Balance } from '../models/balance.model';

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

  updateBalance: function (
    balanceId, 
    status
  ){
    check(balanceId, String);
    check(status, String);
    if (Meteor.isServer)  {
      Balances.collection.update(balanceId, {
        $set: { 
           status: status,
           lastUpdate: new Date()
        }
      });
    }
  },

  findCurrentStoreBalance: function(
    storeId: string
  ): Balance {
    check(storeId, String);
    //find if balance number if for current date and storeId
    // ensure only 1 balance X day X store
    let today = moment().startOf('day');
    let tomorrow = moment(today).add(1, 'days');
    if (Meteor.isServer)  {
      let todayBalance = Balances.findOne(
      {
        createdAt: {
          $gte: today.toDate(),
          $lt: tomorrow.toDate()
        },
        storeId: storeId
      });
      return todayBalance;
    }
  },

  openBalance: function (
    storeId: string,
  ) {
    check(storeId, String);
    let result = undefined;

    if (Meteor.isServer)  {

      let todayBalance = Meteor.call("findCurrentStoreBalance",storeId)
      if (todayBalance) { // if balance found
        // will return the same number
        result = todayBalance.balanceNumber;
        // and if it is in closed state change to open
        if (todayBalance.status == 'CLOSED') {
          Meteor.call("updateBalance", todayBalance._id, "OPEN");
        } else { // if it is in open state nothing to do
        }
      } else { // if balance not found
        // get the last balance information
        let lastCreatedBalance = Balances.collection.find(
          { storeId: storeId }, 
          { sort: { createdAt: -1 }, limit: 1 }
        ).fetch()[0];

        let lastCashExistence = 0;
        if (lastCreatedBalance) { 
          // ensure last created balance its closed before proceed
          if (lastCreatedBalance.status == 'OPEN') {
            Meteor.call("updateBalance", lastCreatedBalance._id, "CLOSED");
          }
          lastCashExistence = lastCreatedBalance.cashExistence;
        }
        // getNextId counter balance and storeid
        MeteorObservable.call('getNextId', 'BALANCE', storeId)
        .subscribe(
          (balanceNumber: number) => { 
            // with the number create db entry for balance
            Balances.insert({
              balanceNumber: balanceNumber,
              cashExistence: lastCashExistence, 
              createdAt: new Date(),
              lastUpdate: new Date(),
              storeId: storeId,
              status: "OPEN"
            });
            result = balanceNumber;
          }, (error) => { 
            throw new Meteor.Error('400', 'No se pudo crear el balance ID');
          }
        ); 
      }
    }
    return result; 
  },

  closeBalance: function (
    storeId: string,
    balanceNumber: number
  ) {
    check(storeId, String);
    check(balanceNumber, Number);
    if (Meteor.isServer)  {
      let balance = Balances.collection.findOne(
        { storeId: storeId, balanceNumber: balanceNumber }
      );
      if (balance) {
        if (balance.status == 'OPEN') {
          Meteor.call("updateBalance", balance._id, "CLOSED");
        }
      } else { 
        throw new Meteor.Error('400', 
          'No se pudo encontrar el balance con nro: ' 
          + balanceNumber + ' y sucursal: ' + storeId );
      }
    }
  }
 
});
