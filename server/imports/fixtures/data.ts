import { Sections } from '../../../both/collections/sections.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Locals } from '../../../both/collections/locals.collection';
import { Products } from '../../../both/collections/products.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Orders } from '../../../both/collections/orders.collection';
import { LocalProducts } from '../../../both/collections/local-products.collection';
import { OrderProducts } from '../../../both/collections/order-products.collection';
import { Balances } from '../../../both/collections/balances.collection';

import { Section } from '../../../both/models/section.model';
import { Category } from '../../../both/models/category.model';
import { Local } from '../../../both/models/local.model';
import { Product } from '../../../both/models/product.model';
import { Stock } from '../../../both/models/stock.model';
import { Order } from '../../../both/models/order.model';
import { LocalProduct } from '../../../both/models/local-product.model';
import { OrderProduct } from '../../../both/models/order-product.model';
import { Balance } from '../../../both/models/balance.model';

import { Accounts } from 'meteor/accounts-base';


export function loadData() {
  if (Products.find().cursor.count() === 0) {


    var defaultUser = {
      username: 'a',
      password: 'a',
      email: 'a@a.com',
      profile: {
        firstName: 'A',
        lastName: 'A'
      },
      isDefault: true,
      roles: ['admin']
    };

    var userId = Accounts.createUser(defaultUser);
    Meteor.users.update(userId, {
        $set: { "emails.0.verified": true}
    });

    Sections.insert({
      _id: "01", 
      name: "Pantalon"
    });
    Sections.insert({
      _id: "02",
      name: "Vestido"
    });
    Sections.insert({
      _id: "03",
      name: "Remera"
    });
    Sections.insert({
      _id: "04",
      name: "Saco"
    });
    Sections.insert({
      _id: "05",
      name: "Campera"
    });

    Categories.insert({
      _id: "01",
      name: 'Shorts',
      sectionId: '01'
    });
    Categories.insert({
      _id: "02",
      name: 'Panatalon Largo',
      sectionId: '01'
    });
    Categories.insert({
      _id: "03",
      name: 'Pantalon Corto',
      sectionId: '01'
    });
    Categories.insert({
      _id: "04",
      name: 'Calza',
      sectionId: '01'
    });
    Categories.insert({
      _id: "05",
      name: 'Pollera',
      sectionId: '02'
    });
    Categories.insert({
      _id: "06",
      name: 'Remera Mangas Corta',
      sectionId: '03'
    });
    Categories.insert({
      _id: "07",
      name: 'Remera Mangas Larga',
      sectionId: '03'
    });
    Categories.insert({
      _id: "08",
      name: 'Camisa',
      sectionId: '03'
    });
    Categories.insert({
      _id: "09",
      name: 'Blusa',
      sectionId: '03'
    });
    Categories.insert({
      _id: "10",
      name: 'Musculosa',
      sectionId: '03'
    });
    Categories.insert({
      _id: "11",
      name: 'Pupera',
      sectionId: '03'
    });
    Categories.insert({
      _id: "12",
      name: 'Saco Sport',
      sectionId: '04'
    });
    Categories.insert({
      _id: "13",
      name: 'Rompeviento',
      sectionId: '05'
    });
    Categories.insert({
      _id: "14",
      name: 'Chupin',
      sectionId: '01'
    });

    Locals.insert({
      _id: "01",
      name: 'Molino',
      address: '25 de mayo 1690'
    });
    Locals.insert({
      _id: "02",
      name: 'Pumpu',
      address: 'colon 1460'
    });

    Products.insert({
      _id: "01",
      name: "Levis Straus",
      code: 100001,
      size: "L",
      color: "Negro",
      brand: "Levis",
      model: "Top 4y",
      categoryId: "06"
    });
    Products.insert({
      _id: "02",
      name: "Chupin clasico Vortex 2017",
      code: 100003,
      size: "XXL",
      color: "Azul",
      brand: "Cuerda",
      model: "AW55G",
      categoryId: "14"
    });
    Products.insert({
      _id: "03",
      name: "Chupin clasico Vortex 2017",
      code: 100003,
      size: "XL",
      color: "Azul",
      brand: "Cuerda",
      model: "AW55G",
      categoryId: "14"
    });
    Products.insert({
      _id: "04",
      name: "Chupin clasico Vortex 2017",
      code: 100003,
      size: "L",
      color: "Azul",
      brand: "Cuerda",
      model: "AW55G",
      categoryId: "14"
    });

    Stocks.insert({
      _id: "01",
      buyPrice: 150,
      buyDate: "2016-07-12T11:23:01Z",
      buyAmount: 50,
      active: true,
      productId: "01"
    });

    Stocks.insert({
      _id: "02",
      buyPrice: 155.32,
      buyDate: "2017-01-11T11:23:01Z",
      buyAmount: 300,
      active: true,
      productId: "02"
    });
    Stocks.insert({
      _id: "03",
      buyPrice: 165.32,
      buyDate: "2017-02-01T11:23:01Z",
      buyAmount: 30,
      active: true,
      productId: "02"
    });
    Stocks.insert({
      _id: "04",
      buyPrice: 165.32,
      buyDate: "2017-02-01T11:23:01Z",
      buyAmount: 30,
      active: true,
      productId: "03"
    });

    LocalProducts.insert({
      _id: "01", 
      amount: 25,
      priceCash: 350,
      priceCard: 400,
      rateCash: 100,
      rateCard: 110,
      active: true,
      localId: "01",
      stockId: "01"
    });
    LocalProducts.insert({
      _id: "02",
      priceCash: 350,
      priceCard: 400,
      rateCash: 100,
      rateCard: 110,
      active: true,
      localId: "02",
      stockId: "01",
      amount: 25
    });
    LocalProducts.insert({
      _id: "03",
      priceCash: 250, 
      priceCard: 300,
      rateCash: 100,
      rateCard: 110,
      active: true,
      localId: "01",
      stockId: "02",
      amount: 200
    });
    LocalProducts.insert({
      _id: "04",
      priceCash: 250, 
      priceCard: 300,
      rateCash: 100,
      rateCard: 110,
      active: true,
      localId: "02",
      stockId: "04",
      amount: 200
    });
    
    Balances.insert({
      _id: "01",
      localId: "01",
      cashExistence: 512, 
      operation: "close", // open // close // extraction // deposit
      actionDate: "2017-01-10T19:23:01Z"
    });
    Balances.insert({
      _id: "02",
      localId: "01",
      cashExistence: 500,
      operation: "open", // open // close // extraction // deposit
      actionDate: "2017-01-12T9:11:01Z"
    });
   
    // check the balance is in open status on current date before order creations
    Orders.insert({
      orderNumber: "00001",
      status: "started",
      localId: "01",
      sellerId: userId,
      lastUpdate: "2017-01-12T9:11:01Z"
    });

    OrderProducts.insert({
      _id: "01",
      productId: "01", 
      orderId: "01",
      quantity: 1,
      subTotal: 350
    });
    OrderProducts.insert({
      _id: "02",
      productId: "02", 
      orderId: "01",
      quantity: 1,
      subTotal: 250
    });

    Balances.insert({
      _id: "03",
      localId: "01",
      cashExistence: 500,
      cashFlow: -100,
      operation: "extraction", // open // close // extraction // deposit
      actionDate: "2017-01-13T9:32:01Z"
    }); 
    Balances.insert({
      _id: "04",
      localId: "01",
      cashExistence: 400,
      cashFlow: 50,
      operation: "deposit", // open // close // extraction // deposit
      actionDate: "2017-01-14T10:13:01Z"
    });

    //started submited reserved
    Orders.update({_id:"01"},{
      $set: { 
        orderProductIds: ["01", "02"],
        status: "submitted",
        subtotal: 500,
        taxes: 105,
        total: 605,
        lastUpdate: "2017-02-12T9:11:01Z"
      }
    });

    // update local stock(before submit)
    LocalProducts.update({ localId: "01", stockId: "01" },{$dec: { amount: 1 }});
    LocalProducts.update({ localId: "01", stockId: "02" },{$dec: { amount: 1 }});
    
    //check the balance is open before submit
    //update the balance to contain submited order information
    Balances.update(
      {localId: "01", sort: {actionDate: -1}, limit: 1},
      {$set:{$inc: {cashFlow: 605, cashExistence: 400}}}
    );

    Balances.insert({
      _id: "03",
      localId: "01",
      cashExistence: 1005,
      operation: "close", // open // close // extraction // deposit
      actionDate: "2017-01-14T9:32:01Z"
    });

  }
} 