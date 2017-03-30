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

let tagNames = definedTags;

function getSevenDigitsCounters(){
  return ['BALANCE','PURCHASE', 'SALE'];
}

function getTwoDigitsCounters(){
  return ['name','model','color','brand','provider','section'];
}


Meteor.methods({

  getNextId(type: string, storeId?: string): number { 
    check(type, String);
    check(storeId, Match.Maybe(String));

    if (Meteor.isServer) {
      let selector = (storeId)?
        {type: type, storeId:storeId}:
        {type: type};
      let counter = Counters.findOne(selector);

      let lastCode:number;
      if (counter) {
        Counters.update(
          {type: type}, 
          {$set:{lastCode: counter.lastCode+1}}
        );
        lastCode = counter.lastCode;
      } else {
        Counters.insert({type: type, lastCode: 10}); 
        lastCode = 10;
      }

      return lastCode;
    }
  }

});
