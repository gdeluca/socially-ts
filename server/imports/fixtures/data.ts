import { Balances } from '../../../both/collections/balances.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Counters } from '../../../both/collections/counters.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { Products } from '../../../both/collections/products.collection';
import { Purchases } from '../../../both/collections/purchases.collection';
import { Sales } from '../../../both/collections/sales.collection';
import { Sections } from '../../../both/collections/sections.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
import { Tags } from '../../../both/collections/tags.collection';
import { Users } from '../../../both/collections/users.collection';

import { Balance } from '../../../both/models/balance.model';
import { Category } from '../../../both/models/category.model';
import { Counter } from '../../../both/models/counter.model';
import { UserStore } from '../../../both/models/user-store.model';
import { ProductPurchase } from '../../../both/models/product-purchase.model';
import { ProductSale } from '../../../both/models/product-sale.model';
import { ProductSize } from '../../../both/models/product-size.model';
import { Product } from '../../../both/models/product.model';
import { Purchase } from '../../../both/models/purchase.model';
import { Sale } from '../../../both/models/sale.model';
import { Section } from '../../../both/models/section.model';
import { Stock } from '../../../both/models/stock.model';
import { Store } from '../../../both/models/store.model';
import { Tag } from '../../../both/models/tag.model';
import { User } from '../../../both/models/user.model';


import { Accounts } from 'meteor/accounts-base';


export function loadData() {
  if (Products.find().cursor.count() === 0) {

    // counters setup
    Counters.insert({
      _id: "01", 
      lastCode: "000001",
      type:"balance"
    });
    
    Counters.insert({
      _id: "02", 
      lastCode: "000001",
      type:"purchase"
    });

    Counters.insert({
      _id: "03", 
      lastCode: "000001",
      type:"sale"
    });

    // tags setup
    Tags.insert({
      code:"01",
      type:"name",
      description:"Bermuda GYM"
    });

    Tags.insert({
      code:"01",
      type:"model",
      description:"Universal"
    });

    Tags.insert({
      code:"01",
      type:"brand",
      description:"Animal"
    });

    Tags.insert({
      code:"01",
      type:"color",
      description:"No definido"
    });

    Tags.insert({
      code:"01",
      type:"category",
      description:"Pantalon"
    });

    Tags.insert({
      code:"01",
      type:"provider",
      description:"Andres"
    });

    Tags.insert({
      code:"02",
      type:"provider",
      description:"Juan"
    });

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
      },
      {
        username: 'b',
        password: 'b',
        email: 'b@b.com',
        profile: {
          firstName: 'b',
          lastName: 'b'
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
     var user_id_2 = Accounts.createUser(users[2]);
    Meteor.users.update(user_id_2, {
        $set: { "emails.0.verified": true}
    });  

    // 1 sections
    Sections.insert({
      _id: "01", 
      name: "Dama"
    });
    Sections.insert({
      _id: "02",
      name: "Caballero"
    });
    Sections.insert({
      _id: "03",
      name: "Niño"
    });

    // 1 stores
    Stores.insert({
      _id: "01",
      name: 'Sucursal1',
      address: '25 de mayo 1690'
    });
    Stores.insert({
      _id: "02",
      name: 'Sucursal2',
      address: 'colon 1460'
    });
    Stores.insert({
      _id: "03",
      name: 'Sucursal3',
      address: 'colon 160'
    });

    // 2 categories
    Categories.insert({
      _id: "01",
      name: 'Ropa Interior',
      sectionId: '01'
    });
    Categories.insert({
      _id: "02",
      name: 'Jean',
      sectionId: '01'
    });
    Categories.insert({
      _id: "03",
      name: 'Panalones Friza',
      sectionId: '02'
    });
    Categories.insert({
      _id: "04",
      name: 'Calzas',
      sectionId: '01'
    });
    Categories.insert({
      _id: "05",
      name: 'Polleras',
      sectionId: '01'
    });
    Categories.insert({
      _id: "06",
      name: 'Remeras',
      sectionId: '01'
    });
    Categories.insert({
      _id: "10",
      name: 'Musculosas',
      sectionId: '01'
    });
    Categories.insert({
      _id: "11",
      name: 'Buzos',
      sectionId: '02'
    });
  
    // 2 balance open or close
    Balances.insert({
      _id: "01",
      balanceNumber: "000001",
      storeId: "01",
      cashExistence: 500, 
      operation: "close", // open // close // extraction // deposit
      actionDate: "2017-01-10T19:23:01Z"
    });
    Balances.insert({
      _id: "02",
      balanceNumber: "000002",
      storeId: "01",
      cashExistence: 500,
      operation: "open", // open // close // extraction // deposit
      actionDate: "2017-01-12T9:11:01Z"
    });
    Balances.insert({
      _id: "03",
      balanceNumber: "000003",
      storeId: "01",
      cashExistence: 1500,
      operation: "open", // open // close // extraction // deposit
      actionDate: "2017-01-13T9:11:01Z"
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
    UserStores.insert({
      _id: "03",
      userId: user_id_2,
      storeId: "01"
    });
    UserStores.insert({
      _id: "04",
      userId: user_id_2,
      storeId: "02"
    });
    UserStores.insert({
      _id: "05",
      userId: user_id_2,
      storeId: "03"
    });

    // 3: products
    Products.insert({
      _id: "01",
      name: "Clasico",
      code: "1010101010",
      color: "Negro",
      brand: "Levis",
      model: "2016",
      provider: "richard",
      categoryId: "02"
    });
    Products.insert({
      _id: "02",
      name: "Vortex Recto",
      code: "1222133010",
      color: "Azul",
      brand: "Cuerda",
      model: "2017",
      provider: "Jhonny",
      categoryId: "02"
    });
    Products.insert({
      _id: "04",
      name: "Chomba Dama",
      code: "1010111011",
      color: "Negro",
      brand: "Evase",
      model: "2017",
      provider: "Jhonny",
      categoryId: "02"
    });
    Products.insert({
      _id: "03",
      name: "Remere Manga Larga",
      code: "1013111011",
      color: "Acuarela",
      brand: "Jaspe",
      model: "2017",
      provider: "Jhonny",
      categoryId: "06"
    });
   
    // 3: sales
    // check the balance is in open status on current date before sale creations
    Sales.insert({
      _id: "01",
      saleNumber: "000001",
      saleState: "started",
      payment: "contado",
      workShift: "morning",
      saleDate: "2017-01-12T9:09:01Z",
      lastUpdate: "2017-01-12T9:11:01Z",
      userStoreId: "01", 
      balanceId: "02"
    });
    Sales.insert({
      _id: "02",
      saleNumber: "000002",
      saleState: "started",
      payment: "contado",
      workShift: "morning",
      saleDate: "2017-01-12T9:07:01Z",
      lastUpdate: "2017-01-12T9:12:01Z",
      userStoreId: "02", 
      balanceId: "03"
    });

    // 4: product sizes
    ProductSizes.insert({
      _id: "01",
       productId: "01",
       barCode: "101010101033",
       size: "33"
    });
    ProductSizes.insert({
      _id: "02",
       productId: "02",
       barCode: "122213301070",
       size: "S"
    });
    ProductSizes.insert({
      _id: "03",
       productId: "02",
       barCode: "122213301073",       
       size: "L"
    });
    ProductSizes.insert({
      _id: "04",
       productId: "02",
       barCode: "122213301074", 
       size: "XL"
    });

    //5: stocks 
    Stocks.insert({
      _id: "01",
      quantity: 10,
      lastCostPrice: 22,
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
      lastCostPrice: 22,
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
      quantity: 30,
      lastCostPrice: 22,
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
      quantity: 40,
      lastCostPrice: 22,
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
      quantity: 50,
      lastCostPrice: 22,
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
      quantity: 60,
      lastCostPrice: 22,
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
      quantity: 70,
      lastCostPrice: 22,
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
      quantity: 80,
      lastCostPrice: 22,
      priceCash: 200,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      active: true,
      storeId: "02",
      productSizeId: "04"
    });

    // 5: purchase 
    Purchases.insert({
       _id: "01",
      purchaseNumber: "000001",
      date: "2016-07-10T11:23:01Z",
      provider:"Juan",
      payment:0
    });
    Purchases.insert({
       _id: "02",
      purchaseNumber: "000002",
      date: "2016-01-11T11:23:01Z",
      provider:"Andres",
      payment:0
    });
    Purchases.insert({
       _id: "03",
      purchaseNumber: "000003",
      date: "2017-07-12T11:23:01Z",
      provider:"Jose",
      payment:0
    });

    // 5: sales entries
    ProductSales.insert({
      _id: "01",
      productSizeId: "01", 
      saleId: "01",
      quantity: 1,
      subTotal: 300
    });
    ProductSales.insert({
      _id: "02",
      productSizeId: "03", 
      saleId: "01",
      quantity: 2,
      subTotal: 420
    });
    ProductSales.insert({
      _id: "03",
      productSizeId: "05", 
      saleId: "01",
      quantity: 1,
      subTotal: 210
    });

    // 6: product purchase
    ProductPurchases.insert({
      quantity: 50,
      cost: 100,
      subtotal:5000,
      purchaseId: "01", 
      productSizeId: "01"
    });
    ProductPurchases.insert({
      quantity: 50,
      cost: 200,
      subtotal:10000,
      purchaseId: "01", 
      productSizeId: "02"
    });

    // 6: update purchase information
    ProductPurchases.update(
      {_id: "01"},
      {$set:{total: 15000}}
    );

    // 6: update balance test
    Balances.insert({
      _id: "03",
      balanceNumber: "000004",
      storeId: "01",
      cashExistence: 500,
      cashFlow: -100,
      operation: "extraction", // open // close // extraction // deposit
      actionDate: "2017-01-13T9:32:01Z"
    }); 
    Balances.insert({
      _id: "04",
      balanceNumber: "000005",
      storeId: "01",
      cashExistence: 400,
      cashFlow: 50,
      operation: "deposit", // open // close // extraction // deposit
      actionDate: "2017-01-14T10:13:01Z"
    });

    //started submitted reserved
    Sales.update({_id:"01"},{
      $set: { 
        productSaleIds: ["01", "02", "03"],
        saleState: "started",
        subtotal: 930,
        taxes: 195.3,
        total: 1125.3,
        lastUpdate: "2017-02-12T9:11:01Z"
      }
    });

    // update local stock(before submit)
    Stocks.update({ _id: "01" },{$dec: { quantity: 1 }});
    Stocks.update({ storeId: "01", productSizeId: "03" },{$dec: { quantity: 2 }});
    Stocks.update({ storeId: "01", productSizeId: "05" },{$dec: { quantity: 1 }});

    //check the balance is open before submit
    //update the balance to contain submitted sale information
    Balances.update(
      {storeId: "01", sort: {actionDate: -1}, limit: 1},
      {$set:{$inc: {cashFlow: 1125.3, cashExistence: 400}}}
    );

    // to the end of day close the balance
    Balances.insert({
      _id: "04",
      balanceNumber: "000006",
      storeId: "01",
      cashExistence: 1125.3,
      operation: "close", // open // close // extraction // deposit
      actionDate: "2017-02-12T19:32:01Z"
    });
  }
} 