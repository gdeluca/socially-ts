import { CollectionObject } from './collection-object.model';
import { Section } from './section.model';

export interface Category extends CollectionObject {
  name: string; 
  section: Section;
}