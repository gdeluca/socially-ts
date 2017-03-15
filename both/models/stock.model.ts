import { CollectionObject } from './collection-object.model';

export interface Stock extends CollectionObject {
  quantity: number;
  active: boolean;
  storeId: string; 
  productSizeId: string;
}