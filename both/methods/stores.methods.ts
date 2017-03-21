import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { MeteorObservable } from 'meteor-rxjs';

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


Meteor.methods({

  addStore: function (
    name: string,
    address: string  
    ) {
    check(name, String);
    check(address, String);
    name = name.toUpperCase();
    address = address.toUpperCase()
    if (Meteor.isServer)  {
      let store = Stores.findOne({name: name});
      if (store) {
        Stores.update(store._id, {
        $set: { 
            name: name,
            address: address,
          }
        });
      } else {
        let storeId = Stores.collection.insert({
          name: name,
          address: address
        });
        MeteorObservable.call('addStoreToStockAndPriceToStore', storeId)
        .subscribe(() => {
          //Bert.alert('Se agregaron los precios al store: ' + storeId , 'success', 'growl-top-right' ); 
        }, (error) => {
          //Bert.alert('Error al agregar los precios:  ${error} ', 'danger', 'growl-top-right' ); 
        });
      }
    }
  }
      
});




