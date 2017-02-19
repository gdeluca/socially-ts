import { CollectionObject } from './collection-object.model';

export interface ProductDetail extends CollectionObject {
  productId: string; 
  quantity: number;
  subTotal: number;
}