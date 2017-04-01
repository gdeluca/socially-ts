import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Counters } from '../collections/counters.collection';
import { Tags, definedTags } from '../../both/collections/tags.collection';

import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';

import { Store } from '../models/store.model';
import { Product } from '../models/product.model';
import { Counter } from '../models/counter.model';


let tagNames = definedTags;

function getSevenDigitsCounters(){
  return ['BALANCE','PURCHASE', 'SALE'];
}

function getTwoDigitsCounters(){
  return ['name','model','color','brand','provider','section'];
}


Meteor.methods({

  getNextId(
    type: string, 
    storeId?: string
  ): number { 
    if (Meteor.isServer) {
      check(type, String);
      check(storeId, Match.Maybe(String));
      let result:number;
      let selector = {type: type}
      if (storeId) {
        selector['storeId'] = storeId;
      }
      let counter = Counters.findOne(selector);
      if (counter) {
        result = counter.lastCode+1
        Counters.update(
          selector, 
          {$set:{lastCode: result}}
        )
      } else {
        result = 10
        selector['lastCode'] = result;
        Counters.insert(<Counter>selector);
      }
     
      return result;
    }
  }

});
