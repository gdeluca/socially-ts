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
import { UserStore } from '../models/user-store.model';
import { Product } from '../models/product.model';
import { ProductSize } from '../models/product-size.model';

import * as _ from 'underscore';

Meteor.methods({

  addUser: function (
    email: string, 
    username: string,
    password: string,
    role: string,
    storeIds: string[]
  ) {
    if (Meteor.isServer) {
      check(email, String);
      check(username, String);
      check(password, String);
      check(role, String);
      check(storeIds, [String]);
      if (_.indexOf(roles, role) == -1 ) {
        throw new Meteor.Error('400', 'Rol Invalido');
      }

      let user = Users.findOne({email: email});
      if (user) {
        throw new Meteor.Error('400', 'El usuario ya existe');
      }

      try {
        let userId = Accounts.createUser({
          username: username,
          password: password,
          email: email,
          profile: {
            name: username
            //lastname: doc.lastname,
            //contact:doc.phoneNumber,
            //bdat:doc.bod,
            //address:doc.address
          }
        });

        storeIds.forEach(storeId => {
          UserStores.collection.insert(
            {
              userId: userId, 
              storeId: storeId
            })
        });
        Roles.addUsersToRoles(userId, role, 'default-group');

      } catch(err) {
        throw new Meteor.Error('400', 'Fallo al crear el usuario: ', err);
      }

    }
  },

  updateUser : function(
    userId: string,
    username: string,
    newStoreIds: string[] = []
  ) {
    if (Meteor.isServer) {
      check(userId, String);
      check(username, String);
      check(newStoreIds, Match.Maybe([String]));
      let user = Users.findOne({_id: userId});
      if (user) {
        throw new Meteor.Error('400', 'Usuario inexistente');
      }
      Users.update({_id: userId}, {
        $set: { 
          username: username.toUpperCase()
        }
      }); 
      
      var currentStoreIds=[];
      UserStores.find({userId: userId}).mergeMap(userStores => {
        return userStores.map(userStore => {
          return userStore.storeId})}).subscribe(res => {currentStoreIds.push(res)});

      var storeIdsToRemove = currentStoreIds.filter(x => newStoreIds.indexOf(x) == -1);
      var storeIdsToAdd = newStoreIds.filter(x => currentStoreIds.indexOf(x) == -1);

      for (let storeId of storeIdsToAdd) {
        UserStores.insert({userId: user._id, storeId: storeId});
      }

      for (let storeId of storeIdsToRemove) {
        UserStores.find({userId: user._id, storeId: storeId})
        .mergeMap(userStores => {return userStores})
        .subscribe((userStore: UserStore) => {
          UserStores.remove(userStore._id)})    
      } 
    }
  },

})
