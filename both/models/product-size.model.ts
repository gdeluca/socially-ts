import { CollectionObject } from './collection-object.model';

export interface ProductSize extends CollectionObject {
  barCode:string;
  productId: string;
  size: string;
}