import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { MeteorObservable } from 'meteor-rxjs';

import { Tags } from '../collections/tags.collection';
import { Tag } from '../models/tag.model';

Meteor.methods({

  updateTag: function (id: string, description: string) {
    check(id, String);
    check(description, String);
    if (Meteor.isServer)  {
      Tags.update(id, {
        $set: { 
          description: description.toUpperCase()
        }
      })
    }
  },

  addTag: function (
    type: string,
    description: string  
    ) {
    check(type, String);
    check(description, String);
    if (Meteor.isServer)  {
      MeteorObservable.call('getNextId', type).subscribe((code: string) => {
      Tags.insert({
          code: code,
          type: type,
          description: description.toUpperCase()
        })   
      });
    }
  },

});
