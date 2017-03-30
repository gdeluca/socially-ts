
import { CollectionObject } from './collection-object.model';

export interface Balance extends CollectionObject {
  balanceNumber: number;
  cashExistence: number;
  createdAt: Date;
  lastUpdate?: Date;
  storeId: string;
  status: string;  // OPEN // CLOSE
}