import { CollectionObject } from './collection-object.model';

export interface Sale extends CollectionObject {
  saleNumber: string;
  status: string; //started submitted reserved canceled
  payment: string; // cash, card, cuenta
  lastUpdate: string;
  saleDate: string;
  userStoreId: string;
  balanceId: string;
  discount?: number;
  taxes?:number;
  subtotal?:number;
  total?: number;
  productSaleIds?: string[];
}