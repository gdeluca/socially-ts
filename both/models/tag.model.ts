import { CollectionObject } from './collection-object.model';

// nombre, color, marca, modelo, categoria, talle
export interface Tag extends CollectionObject {
  code: string; 
  type: string;
  description: string;
}