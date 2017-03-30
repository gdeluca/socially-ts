import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import { Categories } from '../collections/categories.collection';

Meteor.methods({

  saveCategory(name: string, sectionId: string): string { 
    check(name, String);
    check(sectionId, String);
    name = name.toUpperCase();
    if (Meteor.isServer)  {
      let category = Categories.findOne({name:name});
      if (!category) {
        return Categories.collection.insert({
          name: name, 
          sectionId: sectionId 
        });
      }
      throw new Meteor.Error('400', 'No se pudo crear la categoria, ya existe');
    }
  },

  updateCategory(categoryId: string, newName: string, newSectionId: string): number { 
    check(categoryId, String);
    check(newName, String);
    check(newSectionId, String);
    newName = newName.toUpperCase();
    if (Meteor.isServer)  {
      let category = Categories.findOne({_id: categoryId});

      if (category) {
        return Categories.collection.update(category._id, {
          $set: { 
             name: newName,
             sectionId: newSectionId,
          }
        });
      }
      throw new Meteor.Error('400', 'No se pudo actualizar la categoria, no existe');
    }
  }

});
