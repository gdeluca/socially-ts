import { CollectionObject } from './collection-object.model';

export interface OrderProduct extends CollectionObject {
  productId: string; 
  orderId: string; 
  quantity: number;
  subTotal: number;
}