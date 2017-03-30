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
import { MongoObservable } from 'meteor-rxjs';
import { MeteorObservable } from 'meteor-rxjs';


function getCurrentDate(){
  return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
}

function getWorkShift(date){
  return (moment(date).format("HH") > "6" && moment(date).format("HH") < "13")?"MORNING":"AFTERNOON"; 
}

Meteor.methods({

  getBalance: function (date: string) {
    check(date, String);

  },

 

});
