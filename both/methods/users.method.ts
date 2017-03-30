import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { MeteorObservable } from 'meteor-rxjs';
import { Roles } from 'meteor/alanning:roles';

import { Products } from '../collections/products.collection';
import { ProductSizes } from '../collections/product-sizes.collection';
import { Users, rolesMapping, roles } from '../collections/users.collection';
import { UserStores } from '../collections/user-stores.collection';
import { Tags } from '../collections/tags.collection';

import { Tag } from '../models/tag.model';
import { Product } from '../models/product.model';
import { ProductSize } from '../models/product-size.model';

import * as _ from 'underscore';

Meteor.methods({

  signup: function (
    email: string, 
    username: string,
    password: string,
    storeId: string,
    rol: string
  ) {
    check(email, String);
    check(username, String);
    check(password, String);
    check(storeId, String);
    check(rol, String);
    if (Meteor.isServer) {
      if (_.indexOf(roles, rol) == -1 ) {
        throw new Meteor.Error('400', 'Rol Invalido');
      }

      let user = Users.findOne({email: email});
      if (user) {
        throw new Meteor.Error('400', 'Usuario existente');
      }

      let userId = Accounts.createUser(
        {
          email: email,
          username: username,
          password: password,
          profile: { name: username }
        }, 
        function(error, result) {
          if (error) {
            throw new Meteor.Error('400', 'Fallo al crear el usuario: ', error);
          } else {
          UserStores.collection.insert(
            {
              userId: userId, 
              storeId: storeId
            })
          Roles.addUsersToRoles(userId, rol, 'default-group');
          }
        }
      )
    }
  },

})
