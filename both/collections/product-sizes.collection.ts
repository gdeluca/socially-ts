import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSize } from '../models/product-size.model';

export const ProductSizes = new MongoObservable.Collection<ProductSize>('productSizes');
export const lettersSizes = {'S':'700','M':'701','L':'702','XL':'703','XXL':'704','XXXL':'705','XXXXL':'706'};
export const uniqueSize = {'UNICO':'699'};

export function getMappingSize(size: string){
  if (size) {
    if (!isNaN(+size)) {  // if is numeric
      if (size.length > 3) {
        size = size.substring(0,3);
      }
      return Array(3-size.length).join("0")+""+size; 
    } else {
      size = size.toUpperCase();
      if (lettersSizes[size]) {
        return lettersSizes[size];
      } else if (uniqueSize[size]) {
        return uniqueSize[size];
      }
    }
  }
  return "talle-invalido";
}

ProductSizes.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ProductSizes.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});