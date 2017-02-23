import { CollectionObject } from './collection-object.model';

export interface OrderEntry extends CollectionObject {
  quantity: number;
  subTotal: number;
  orderId: string; 
  productSizeId: string; 
}