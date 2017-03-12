import { CollectionObject } from './collection-object.model';

export interface ProductSale extends CollectionObject {
  quantity: number;
  subTotal?: number;
  saleId: string; 
  productSizeId: string; 
}