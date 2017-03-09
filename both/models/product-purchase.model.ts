import { CollectionObject } from './collection-object.model';

export interface ProductPurchase extends CollectionObject {
  quantity: number;
  cost: number;
  subtotal?:number;
  purchaseId: string; 
  productSizeId: string; 
}