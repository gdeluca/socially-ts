import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Tag } from '../models/tag.model';

export const Tags = new MongoObservable.Collection<Tag>('tags');
export const definedTags = ['name','model','color','brand','provider','section'];

export const tagsMapping = {
    'name': 'Nombre', 
    'model': 'Modelo', 
    'color': 'Color',
    'brand': 'Marca',
    'provider':'Proveedor',
    'section': 'Seccion'
  };

Tags.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Tags.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});
