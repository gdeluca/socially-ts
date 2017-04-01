import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

import { Categories } from '../collections/categories.collection';

Meteor.methods({

  saveCategory(
    name: string, 
    sectionId: string
  ): string { 
    if (Meteor.isServer)  {
      check(name, String);
      check(sectionId, String);
      name = name.toUpperCase();
      let category = Categories.findOne({name:name});
      
      if (category) {
        throw new Meteor.Error('400', 
          'No se creo la categoria, ya existe');
      }

      return Categories.collection.insert({
        name: name, 
        sectionId: sectionId 
      });
    }
  },

  updateCategory(
    categoryId: string, 
    newName: string, 
    newSectionId: string
  ): number { 
    if (Meteor.isServer)  {
      check(categoryId, String);
      check(newName, String);
      check(newSectionId, String);
      newName = newName.toUpperCase();
      let category = Categories.findOne(
        {_id: categoryId}, {fields: {_id: 1}});

      if (!category) {
        throw new Meteor.Error('400', 
          'No se actualizo la categoria, no existe');
      }
       
      return Categories.collection.update(category._id, {
        $set: { 
          name: newName,
          sectionId: newSectionId,
        }
      });
    }
  }

});
