import { CollectionObject } from './collection-object.model';

export interface Sale extends CollectionObject {
  saleNumber: number;
  saleState: string; //STARTED // SUBMITTED // RESERVED // CANCELED
  payment: string;   // CASH // CARD // ACCOUNT
  createdAt: Date;
  lastUpdate: Date;
  workShift: string; // MORNING AFTERNOON
  userStoreId: string;
  balanceId: string;
  discount?: number;
  taxes?:number;
  subtotal?:number;
  total?: number;
}