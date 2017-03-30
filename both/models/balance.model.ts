
import { CollectionObject } from './collection-object.model';

export interface Balance extends CollectionObject {
  balanceNumber: number;
  cashExistence: number;
  workShift: string;
  createdAt: Date;
  storeId: string;
  status: string;  // OPEN // CLOSE
}