import { CollectionObject } from './collection-object.model';

export interface BalanceOperation extends CollectionObject {
  amount: number;
  operationType: string; // EXTRACTION // DEPOSIT
  createdAt: Date;
  balanceId: string;
}