import { CollectionObject } from './collection-object.model';

export interface ProductPurchase extends CollectionObject {
  quantity: number;
  cost: number;
  subTotal?:number;
  purchaseId: string; 
  productSizeId: string; 
}