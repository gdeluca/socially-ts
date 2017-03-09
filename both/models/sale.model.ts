import { CollectionObject } from './collection-object.model';

export interface Sale extends CollectionObject {
  saleNumber: string;
  taxes?:number;
  subtotal?:number;
  total?: number;
  discount?: number;
  status: string; //started submited reserved
  lastUpdate: string;
  productSaleIds?: string[];
  userStoreId: string;
  balanceId: string;
}