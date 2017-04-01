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
    if (Meteor.isServer) {
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
          MeteorObservable.call(
            'addStoreToStockAndPrice', 
            storeId
          ).subscribe(() => {
            // Se agregaron los precios al store
          }, (error) => {
            throw new Meteor.Error('400', 'Fallo al agregar los precios: ', error);
          });
        }
      }
    }
  },

  updateStore: function (
    storeId: string, 
    name: string,
    address: string
  ) {
    if (Meteor.isServer) {
      check(storeId, String);
      check(name, String);
      check(address, String);
      let store = Stores.findOne({_id:storeId});
      if (!store) {
        throw new Meteor.Error('400', 'Sucursal no encontrada ');
      }
      Stores.update(storeId, {
        $set: { 
          name: name.toUpperCase(),
          address: address.toUpperCase()
        }
      })
    }
  },
      
});




