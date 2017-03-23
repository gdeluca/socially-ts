import { CollectionObject } from './collection-object.model';

export interface Sale extends CollectionObject {
  saleNumber: string;
  saleState: string; //STARTED // SUBMITTED // RESERVED // CANCELED
  payment: string;   // CASH // CARD // ACCOUNT
  saleDate: string;
  lastUpdate: string;
  workShift: string; // MORNING AFTERNOON
  userStoreId: string;
  balanceId: string;
  discount?: number;
  taxes?:number;
  subtotal?:number;
  total?: number;
}