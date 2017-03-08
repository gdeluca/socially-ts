import { CollectionObject } from './collection-object.model';

// contador para lo codigos de los formularios
export interface Counter extends CollectionObject {
  lastCode: number; 
  type: string;
}