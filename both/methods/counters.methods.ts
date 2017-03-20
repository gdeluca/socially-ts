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
  return ['balance','purchase', 'sales'];
}

function getTwoDigitsCounters(){
  return ['name','model','color','brand','provider','section'];
}

Meteor.methods({

  getNextId(type: string): string { 
    if (Meteor.isServer) {
        var counter = Counters.findOne({type: type});
        var lastCode = ""
        if (counter) {
          Counters.update({type: type}, {$set:{lastCode: counter.lastCode+1}});
          lastCode = ""+(counter.lastCode+1);
        } else {
          Counters.insert({type: type, lastCode: 1}); 
          lastCode = "1";
        }

        if (getSevenDigitsCounters().indexOf(type) > -1) {
          return Array(8-lastCode.length).join("0")+""+lastCode; 
        } else if (getTwoDigitsCounters().indexOf(type) > -1) {
          return Array(3-lastCode.length).join("0")+""+lastCode; 
        }

        return "ee"+lastCode;
    }
  }

});




