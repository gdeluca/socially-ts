import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSize } from '../models/product-size.model';

export const ProductSizes = new MongoObservable.Collection<ProductSize>('productSizes');
const mappingSizes = {'S':'70','M':'71','L':'73','XL':'74','XXL':'75','XXXL':'76','XXXXL':'76','UNICO':'00'};

export function getMappingSize(size: string){
  if (size) {
    if (size.length == 1 && !isNaN(+size)){
      size = '0'+size;
    } else if (isNaN(+size)){
      size = size.toUpperCase();
      if (mappingSizes[size]){
        return mappingSizes[size];
      } else {
        return 'talleinvalido'
      }
    }
  }
  return size;
}

function loggedIn() {
  return !!Meteor.user();
}
 
ProductSizes.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

