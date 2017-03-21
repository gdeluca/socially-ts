import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { MeteorObservable } from 'meteor-rxjs';

import { Products } from '../collections/products.collection';
import { ProductSizes } from '../collections/product-sizes.collection';


import { Tags } from '../collections/tags.collection';
import { Tag } from '../models/tag.model';
import { Product } from '../models/product.model';
import { ProductSize } from '../models/product-size.model';


function updateDependantEntities(type:string, description: string, newDescription:string) {
  switch (type) {
    case "name":
    case "model":
    case "brand":
    case "color":
    case "provider":
      Products.update({[type]: description},{$set:{[type]:newDescription}});
      break;
    case "size":
      ProductSizes.update({[type]: description},{$set:{[type]:newDescription}});
      break;
  } 
}

Meteor.methods({

  updateTag: function (id: string, description: string) {
    check(id, String);
    check(description, String);
    let tag = Tags.findOne({_id: id});

    if (Meteor.isServer) {
      updateDependantEntities(tag.type, tag.description, description.toUpperCase());
      Tags.update(id, {
        $set: { 
          description: description.toUpperCase()
        }
      })
    }
  },

  addTag: function (
    type: string,
    description: string  
    ) {
    check(type, String);
    check(description, String);
    if (Meteor.isServer)  {
      let tag = Tags.findOne({type: type, description: description.toUpperCase()});
      // if tag not found then create one, otherwise nothing to do
      if (!tag) {
        MeteorObservable.call('getNextId', type).subscribe((code: string) => {
        Tags.insert({
            code: code,
            type: type,
            description: description.toUpperCase()
          })   
        });
      }
    }
  },

});
