import { Sections } from '../../../both/collections/sections.collection';
import { Stores } from '../../../both/collections/stores.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { Balances } from '../../../both/collections/balances.collection';
import { Products } from '../../../both/collections/products.collection';
import { Orders } from '../../../both/collections/orders.collection';
import { Purchases } from '../../../both/collections/purchases.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { OrderEntries } from '../../../both/collections/order-entries.collection';

import { Section } from '../../../both/models/section.model';
import { Store } from '../../../both/models/store.model';
import { Category } from '../../../both/models/category.model';
import { UserStore } from '../../../both/models/user-store.model';
import { Balance } from '../../../both/models/balance.model';
import { Product } from '../../../both/models/product.model';
import { Order } from '../../../both/models/order.model';
import { Purchase } from '../../../both/models/purchase.model';
import { ProductSize } from '../../../both/models/product-size.model';
import { Stock } from '../../../both/models/stock.model';
import { OrderEntry } from '../../../both/models/order-entry.model';

import { Accounts } from 'meteor/accounts-base';


export function loadData() {
  if (Products.find().cursor.count() === 0) {

    // 1 users
    var users = [
      {
        username: 'guille',
        password: 'guille',
        email: 'guille@test.com',
        profile: {
          firstName: 'Guille',
          lastName: 'test'
        },
        isDefault: true,
        roles: ['admin']
      },
      {
        username: 'marce',
        password: 'marce',
        email: 'marce@test.com',
        profile: {
          firstName: 'Marce',
          lastName: 'test'
        },
        isDefault: true,
        roles: ['admin']
      }
    ];

    var user_id_0 = Accounts.createUser(users[0]);
    Meteor.users.update(user_id_0, {
        $set: { "emails.0.verified": true}
    });  
  
    var user_id_1 = Accounts.createUser(users[1]);
    Meteor.users.update(user_id_1, {
        $set: { "emails.0.verified": true}
    });  

    // 1 sections
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

    // 1 stores
    Stores.insert({
      _id: "02",
      name: 'Molino',
      address: '25 de mayo 1690'
    });
    Stores.insert({
      _id: "01",
      name: 'Pumpu',
      address: 'colon 1460'
    });

    // 2 categories
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

    // 2 balance open or close
    Balances.insert({
      _id: "01",
      storeId: "01",
      cashExistence: 500, 
      operation: "close", // open // close // extraction // deposit
      actionDate: "2017-01-10T19:23:01Z"
    });
    Balances.insert({
      _id: "02",
      storeId: "01",
      cashExistence: 500,
      operation: "open", // open // close // extraction // deposit
      actionDate: "2017-01-12T9:11:01Z"
    });
    Balances.insert({
      _id: "03",
      storeId: "01",
      cashExistence: 1500,
      operation: "open", // open // close // extraction // deposit
      actionDate: "2017-01-12T9:11:01Z"
    });

    // 2: user stores
    UserStores.insert({
      _id: "01",
      userId: user_id_0,
      storeId: "01"
    });
    UserStores.insert({
      _id: "02",
      userId: user_id_1,
      storeId: "02"
    });

    // 3: products
    Products.insert({
      _id: "01",
      name: "Levis Straus",
      code: 100001,
    //  size: "L",
      color: "Negro",
      brand: "Levis",
      model: "Top 4y",
      categoryId: "06"
    });
    Products.insert({
      _id: "02",
      name: "Chupin clasico Vortex 2017",
      code: 100002,
      //size: "XXL",
      color: "Azul",
      brand: "Cuerda",
      model: "AW55G",
      categoryId: "14"
    });
   
    // 3: orders
    // check the balance is in open status on current date before order creations
    Orders.insert({
      _id: "01",
      orderNumber: "00001",
      status: "started",
      lastUpdate: "2017-01-12T9:11:01Z",
      userStoreId: "01", //guille en pumpu
      balanceId: "02" // an open balance
    });
    Orders.insert({
      _id: "02",
      orderNumber: "00002",
      status: "started",
      lastUpdate: "2017-01-12T9:11:01Z",
      userStoreId: "02", //marce en molino
      balanceId: "03" // an open balance
    });

    // 4: product purchase 
    Purchases.insert({
      price: 150,
      date: "2016-07-12T11:23:01Z",
      quantity: 50,
      productId: "01"
    });
    Purchases.insert({
      price: 100,
      date: "2016-01-11T11:23:01Z",
      quantity: 300,
      productId: "02"
    });
    Purchases.insert({
      price: 190,
      date: "2017-07-12T11:23:01Z",
      quantity: 50,
      productId: "02"
    });

    // 4: product sizes
    ProductSizes.insert({
      _id: "01",
       productId: "01",
       size: "33"
    });
    ProductSizes.insert({
      _id: "02",
       productId: "02",
       size: "S"
    });
    ProductSizes.insert({
      _id: "03",
       productId: "02",
       size: "L"
    });
    ProductSizes.insert({
      _id: "04",
       productId: "02",
       size: "XL"
    });

    //5: stocks 
    Stocks.insert({
      _id: "01",
      quantity: 30,
      priceCash: 300,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "01",
      productSizeId: "01"
    });
    Stocks.insert({
      _id: "02",
      quantity: 20,
      priceCash: 300,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "02",
      productSizeId: "01"
    });
    Stocks.insert({
      _id: "03",
      quantity: 20,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "01",
      productSizeId: "02"
    });
    Stocks.insert({
      _id: "04",
      quantity: 20,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "02",
      productSizeId: "02"
    });
    Stocks.insert({
      _id: "05",
      quantity: 20,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "01",
      productSizeId: "03"
    });
    Stocks.insert({
      _id: "06",
      quantity: 20,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "02",
      productSizeId: "03"
    });
    Stocks.insert({
      _id: "07",
      quantity: 20,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "01",
      productSizeId: "04"
    });
    Stocks.insert({
      _id: "08",
      quantity: 30,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "02",
      productSizeId: "04"
    });

    // 5: order entries
    OrderEntries.insert({
      _id: "01",
      productSizeId: "01", 
      orderId: "01",
      quantity: 1,
      subTotal: 300
    });
    OrderEntries.insert({
      _id: "02",
      productSizeId: "03", 
      orderId: "01",
      quantity: 2,
      subTotal: 420
    });
    OrderEntries.insert({
      _id: "03",
      productSizeId: "05", 
      orderId: "01",
      quantity: 1,
      subTotal: 210
    });

    // 6: update balance test
    Balances.insert({
      _id: "03",
      storeId: "01",
      cashExistence: 500,
      cashFlow: -100,
      operation: "extraction", // open // close // extraction // deposit
      actionDate: "2017-01-13T9:32:01Z"
    }); 
    Balances.insert({
      _id: "04",
      storeId: "01",
      cashExistence: 400,
      cashFlow: 50,
      operation: "deposit", // open // close // extraction // deposit
      actionDate: "2017-01-14T10:13:01Z"
    });

    //started submited reserved
    Orders.update({_id:"01"},{
      $set: { 
        orderEntryIds: ["01", "02", "03"],
        status: "submitted",
        subtotal: 930,
        taxes: 195.3,
        total: 1125.3,
        lastUpdate: "2017-02-12T9:11:01Z"
      }
    });

    // update local stock(before submit)
    Stocks.update({ storeId: "01", productSizeId: "01" },{$dec: { quantity: 1 }});
    Stocks.update({ storeId: "01", productSizeId: "03" },{$dec: { quantity: 2 }});
    Stocks.update({ storeId: "01", productSizeId: "05" },{$dec: { quantity: 1 }});

    //check the balance is open before submit
    //update the balance to contain submited order information
    Balances.update(
      {storeId: "01", sort: {actionDate: -1}, limit: 1},
      {$set:{$inc: {cashFlow: 1125.3, cashExistence: 400}}}
    );

    // to the end of day close the balance
    Balances.insert({
      _id: "03",
      storeId: "01",
      cashExistence: 1125.3,
      operation: "close", // open // close // extraction // deposit
      actionDate: "2017-02-12T19:32:01Z"
    });
  }
} 