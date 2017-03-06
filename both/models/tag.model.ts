import { CollectionObject } from './collection-object.model';

// nombre, color, marca, modelo, categoria, talle
// nnnn-c-mm-oo-cc-tt
export interface Tag extends CollectionObject {
  code: string; 
  type: string;
  description: string;
}