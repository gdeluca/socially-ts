import { CollectionObject } from './collection-object.model';

export interface BalanceOperation extends CollectionObject {
  existenceBefore: number;
  cashOperated: number;
  operationType: string; // EXTRACTION // DEPOSIT
  createdAt: Date;
  balanceId: string;
}