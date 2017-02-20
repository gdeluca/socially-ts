import { CollectionObject } from './collection-object.model';
import { Category } from './category.model';


export interface Product extends CollectionObject {
  name: string;
  code: number;
  size: string;
  color: string;
  description: string;
  price: number;
  rate: number;
  categoryId: string;
  active: boolean;
}