import { CollectionObject } from './collection-object.model';
import { Category } from './category.model';


export interface Product extends CollectionObject {
  name: string;
  code: number;
  size: number;
  color: string;
  category: Category;
}