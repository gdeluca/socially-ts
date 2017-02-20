import { CollectionObject } from './collection-object.model';

export interface Local extends CollectionObject {
  name: string; 
  address: string;
}