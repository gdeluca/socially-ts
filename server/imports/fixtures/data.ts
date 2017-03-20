import { Balances } from '../../../both/collections/balances.collection';
import { Categories } from '../../../both/collections/categories.collection';
import { Counters } from '../../../both/collections/counters.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
import { ProductPrices } from '../../../both/collections/product-prices.collection';
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
import { ProductPrice } from '../../../both/models/product-price.model';
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


    // // counters setup
    // MeteorObservable.call('getNextId', "BALANCE").subscribe((id) => {
    //   console.log(id);
    //   Counters.insert({
    //     _id: "01", 
    //     lastCode: id,
    //     type:"BALANCE"
    //   });
    // });
    
    // MeteorObservable.call('getNextId', "PURCHASE").subscribe((id) => {
    //   Counters.insert({
    //     _id: "02",
    //     lastCode:  id,
    //     type:"PURCHASE"
    //   });
    // });

    // MeteorObservable.call('getNextId', "PURCHASE").subscribe((id) => {
    //   Counters.insert({
    //     _id: "03", 
    //     lastCode:  id,
    //     type:"SALE"
    //   });
    // });
    // counters setup
    Counters.insert({
      _id: "01", 
      lastCode: 10,
      type:"BALANCE"
    });
    
    Counters.insert({
      _id: "02", 
      lastCode:  10,
      type:"PURCHASE"
    });

    Counters.insert({
      _id: "03", 
      lastCode: 10,
      type:"SALE"
    });

    // tags setup
    Tags.insert({
      code:"00",
      type:"name", 
      description:"ACTIVE"
    });
    Tags.insert({
      code:"00",
      type:"model",
      description:"ACTIVE"
    });
    Tags.insert({
      code:"00",
      type:"brand",
      description:"ACTIVE"
    });
    Tags.insert({
      code:"00",
      type:"color",
      description:"ACTIVE"
    });
    Tags.insert({
      code:"00",
      type:"section",
      description:"ACTIVE"
    });
    Tags.insert({
      code:"00",
      type:"provider",
      description:"ACTIVE"
    });

    // tags: some test data
    Tags.insert({
      code:"01",
      type:"name",
      description:"BERMUDA GYM"
    });
    Tags.insert({
      code:"01",
      type:"model",
      description:"UNIVERSAL"
    });
    Tags.insert({
      code:"01",
      type:"brand",
      description:"ANIMAL"
    });
    Tags.insert({
      code:"01",
      type:"color",
      description:"AZUL"
    });
    Tags.insert({
      code:"01",
      type:"section",
      description:"DAMA"
    });
    Tags.insert({
      code:"02",
      type:"section",
      description:"CABALLERO"
    });
    Tags.insert({
      code:"03",
      type:"section",
      description:"NIÑO"
    });
    Tags.insert({
      code:"01",
      type:"provider",
      description:"ANDRES"
    });
    Tags.insert({
      code:"02",
      type:"provider",
      description:"JUAN"
    });

    // 1 users
    var users = [
      {
        username: 'GUIIIE',
        password: 'GUILLE',
        email: 'GUILLE@TEST.COM',
        profile: {
          firstName: 'GUILLE',
          lastName: 'TEST'
        },
        isDefault: true,
        roles: ['admin']
      },
      {
        username: 'MARCE',
        password: 'MARCE',
        email: 'MARCE@TEST.COM',
        profile: {
          firstName: 'MARCE',
          lastName: 'TEST'
        },
        isDefault: true,
        roles: ['admin']
      },
      {
        username: 'B',
        password: 'B',
        email: 'B@B.COM',
        profile: {
          firstName: 'B',
          lastName: 'B'
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
      name: 'SUCURSAL 1',
      address: '25 DE MAYO 1690'
    });
    Stores.insert({
      _id: "02",
      name: 'SUCURSAL 2',
      address: 'COLON 1460'
    });
    Stores.insert({
      _id: "03",
      name: 'SUCURSAL 3',
      address: 'COLON 160'
    });

    // 1: purchases
    Purchases.insert({
       _id: "01",
      purchaseNumber: "000001",
      purchaseState: "LOADED",
      purchaseDate: "2016-07-10T11:23:01Z",
      lastUpdate: "2016-07-10T11:23:01Z",
      provider:"JUAN",
      paymentAmount:0
    });
    Purchases.insert({
       _id: "02",
      purchaseNumber: "000002",
      purchaseState: "RECEIVED",
      purchaseDate: "2016-01-11T11:23:01Z",
      lastUpdate: "2016-07-10T11:23:01Z",
      provider:"ANDRES",
      paymentAmount:1000
    });
    Purchases.insert({
       _id: "03",
      purchaseNumber: "000003",
      purchaseState: "REQUESTED",
      purchaseDate: "2017-07-12T11:23:01Z",
      lastUpdate: "2016-07-10T11:23:01Z",
      provider:"JOSE",
      paymentAmount:100
    });

    // 2 categories
    Categories.insert({
      _id: "01",
      name: 'ROPA INTERIOR',
      sectionId: '01'
    });
    Categories.insert({
      _id: "02",
      name: 'JEANSS',
      sectionId: '01'
    });
    Categories.insert({
      _id: "03",
      name: 'ESCOLARES',
      sectionId: '02'
    });
    Categories.insert({
      _id: "04",
      name: 'CALZAS',
      sectionId: '01'
    });
    Categories.insert({
      _id: "05",
      name: 'POLLERAS',
      sectionId: '01'
    });
    Categories.insert({
      _id: "06",
      name: 'REMERAS',
      sectionId: '01'
    });
    Categories.insert({
      _id: "10",
      name: 'MUSCULOSAS',
      sectionId: '01'
    });
    Categories.insert({
      _id: "11",
      name: 'BUSOS',
      sectionId: '02'
    });
  
    // 2 balance open or close
    // OPEN // CLOSE // EXTRACTION // DEPOSIT
    Balances.insert({
      _id: "01",
      balanceNumber: "000001",
      storeId: "01",
      cashExistence: 500, 
      operation: "CLOSE", 
      actionDate: "2017-01-10T19:23:01Z"
    });
    Balances.insert({
      _id: "02",
      balanceNumber: "000002",
      storeId: "01",
      cashExistence: 500,
      operation: "OPEN",
      actionDate: "2017-01-12T9:11:01Z"
    });
    Balances.insert({
      _id: "03",
      balanceNumber: "000003",
      storeId: "01",
      cashExistence: 1500,
      operation: "OPEM", 
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
      name: "CLASICO",
      code: "1010101010",
      color: "NEGRO",
      brand: "LEVIS",
      model: "2016",
      provider: "ANDRES",
      categoryId: "02"
    });
    Products.insert({
      _id: "02",
      name: "VORTEX",
      code: "1222133010",
      color: "AZUL",
      brand: "CUERDA",
      model: "VIX",
      provider: "JUAN",
      categoryId: "02"
    });
    Products.insert({
      _id: "03",
      name: "CHOMBA",
      code: "1010111011",
      color: "NEGRO",
      brand: "EVASE",
      model: "TADY",
      provider: "JUAN",
      categoryId: "02"
    });
    Products.insert({
      _id: "04",
      name: "REMERA MANGA",
      code: "1013111011",
      color: "ACUARELA",
      brand: "JASPE",
      model: "22R",
      provider: "ANDRES",
      categoryId: "06"
    });
   
    // 3: sales
    // check the balance is in open status 
    // on current date before sale creations
    Sales.insert({
      _id: "01",
      saleNumber: "000001",
      saleState: "STARTED",
      payment: "CASH",
      workShift: "MORNING",
      saleDate: "2017-01-12T9:09:01Z",
      lastUpdate: "2017-01-12T9:11:01Z",
      userStoreId: "01", 
      balanceId: "02"
    });
    Sales.insert({
      _id: "02",
      saleNumber: "000002",
      saleState: "STARTED",
      payment: "CASH",
      workShift: "MORNING",
      saleDate: "2017-01-12T9:07:01Z",
      lastUpdate: "2017-01-12T9:12:01Z",
      userStoreId: "02", 
      balanceId: "03"
    });

    // 4: setting product sizes
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
    ProductSizes.insert({
      _id: "03",
      productId: "03",
      barCode: "122213301073",       
      size: "UNICO"
    });

    // 4: settings product prices
    ProductPrices.insert({
      _id: "01",
      lastCostPrice: 150,
      priceCash: 300,
      priceCard: 210,
      rateCash: 100,
      rateCard: 110,
      productId: "01",
      storeId: "01"
    });
    ProductPrices.insert({
      _id: "02",
      lastCostPrice: 100,
      priceCash: 250,
      priceCard: 220,
      productId: "03",
      storeId: "01"
    });
    ProductPrices.insert({
      _id: "03",
      lastCostPrice: 22,
      priceCash: 300,
      priceCard: 210,
      productId: "02",
      storeId: "01"
    });
    ProductPrices.insert({
      _id: "04",
      lastCostPrice: 50,
      priceCash: 100,
      priceCard: 150,
      productId: "02",
      storeId: "02"
    });

    //5: stocks 
    Stocks.insert({
      _id: "01",
      quantity: 10,
      active: true,
      storeId: "01",
      productSizeId: "01"
    });
    Stocks.insert({
      _id: "02",
      quantity: 20,
      active: true,
      storeId: "02",
      productSizeId: "01"
    });
    Stocks.insert({
      _id: "03",
      quantity: 30,
      active: true,
      storeId: "01",
      productSizeId: "02"
    });
    Stocks.insert({
      _id: "04",
      quantity: 40,
      active: true,
      storeId: "02",
      productSizeId: "02"
    });
    Stocks.insert({
      _id: "05",
      quantity: 50,
      active: true,
      storeId: "01",
      productSizeId: "03"
    });
    Stocks.insert({
      _id: "06",
      quantity: 60,
      active: true,
      storeId: "02",
      productSizeId: "03"
    });
    Stocks.insert({
      _id: "07",
      quantity: 70,
      active: true,
      storeId: "01",
      productSizeId: "04"
    });
    Stocks.insert({
      _id: "08",
      quantity: 80,
      active: true,
      storeId: "02",
      productSizeId: "04"
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
      operation: "EXTRACTION", // OPEN // CLOSE // EXTRACTION // DEPOSIT
      actionDate: "2017-01-13T9:32:01Z"
    }); 
    Balances.insert({
      _id: "04",
      balanceNumber: "000005",
      storeId: "01",
      cashExistence: 400,
      cashFlow: 50,
      operation: "DEPOSIT", // OPEN // CLOSE // EXTRACTION // DEPOSIT
      actionDate: "2017-01-14T10:13:01Z"
    });

    //started submitted reserved
    Sales.update({_id:"01"},{
      $set: { 
        saleState: "STARTED",
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
      operation: "CLOSE", // OPEN // CLOSE // EXTRACTION // DEPOSIT
      actionDate: "2017-02-12T19:32:01Z"
    });
  }
} 