import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSize } from '../models/product-size.model';

export const ProductSizes = new MongoObservable.Collection<ProductSize>('productSizes');
export const lettersSizes = {'S':'70','M':'71','L':'72','XL':'73','XXL':'74','XXXL':'75','XXXXL':'76'};
export const uniqueSize = {'UNICO':'00'};

export function getMappingSize(size: string){
  if (size) {
    if (size.length == 1 && !isNaN(+size)){
      size = '0'+size;
    } else if (isNaN(+size)) {
      size = size.toUpperCase();
      if (lettersSizes[size]) {
        return lettersSizes[size];
      } else if (uniqueSize[size]) {
        return uniqueSize[size];
      } else {
        return 'TALLE-INVALIDO'
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

