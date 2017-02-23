import { CollectionObject } from './collection-object.model';

export interface Order extends CollectionObject {
  orderNumber: string;
  taxes?:number;
  subtotal?:number;
  total?: number;
  discount?: number;
  status: string; //started submited reserved
  lastUpdate: string;
  orderEntryIds?: string[];
  userStoreId: string;
  balanceId: string;
}