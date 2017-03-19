import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Counters } from '../collections/counters.collection';

import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';
import { Product } from '../models/product.model';

function getCounterCollections(){
  return ['balance','purchase', 'sales'];
}

Meteor.methods({

  getNextId(type: string) { 
    if (Meteor.isServer) {
        var counter = Counters.findOne({type: type});
        if (counter) {
          Counters.update({type: type}, {$set:{lastCode: counter.lastCode+1}});
        } else {
          Counters.insert({type: type, lastCode: 1}); 
        }
        var lastCode = ""+(counter.lastCode+1);
        return Array(7-lastCode.length).join("0")+""+lastCode; 
    }
  }

});




