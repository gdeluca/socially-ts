import { Balances } from '../../../both/collections/balances.collection';
import { BalanceOperations } from '../../../both/collections/balance-operations.collection';
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
import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
import { Tags } from '../../../both/collections/tags.collection';
import { Users } from '../../../both/collections/users.collection';
import { Balance } from '../../../both/models/balance.model';
import { BalanceOperation } from '../../../both/models/balance-operation.model';
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
import { Stock } from '../../../both/models/stock.model';
import { Store } from '../../../both/models/store.model';
import { Tag } from '../../../both/models/tag.model';
import { User } from '../../../both/models/user.model';


import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { MongoObservable, MeteorObservable } from 'meteor-rxjs';

export function loadData() {
  if (Products.find().cursor.count() === 0) {


    // // counters setup
    MeteorObservable.call('getNextId', "BALANCE", "01").subscribe((id) => {
    });
    
    MeteorObservable.call('getNextId', "PURCHASE", "01").subscribe((id) => {
    });

    MeteorObservable.call('getNextId', "PURCHASE", "01").subscribe((id) => {
    });
    
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
    Counters.insert({
      _id: "04", 
      lastCode: 10,
      type:"name"
    });
    
    Counters.insert({
      _id: "05", 
      lastCode:  10,
      type:"model"
    });

    Counters.insert({
      _id: "06", 
      lastCode: 10,
      type:"brand"
    });
    Counters.insert({
      _id: "07", 
      lastCode: 10,
      type:"color"
    });
    
    Counters.insert({
      _id: "08", 
      lastCode:  10,
      type:"section"
    });

    Counters.insert({
      _id: "09", 
      lastCode: 10,
      type:"provider"
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

    let userA = {
      name:"GUILLE",
      email:"GUILLE@TEST.COM",
      password:"GUILLE",
      roles:['administrator']};
    let userIdA = Accounts.createUser({
      email: userA.email,
      username: userA.name,
      password: userA.password,
      profile: { name: userA.name }
    });
    Roles.addUsersToRoles(userIdA, userA.roles, 'default-group');
      
    let userB = {
      name:"MARCE",
      password:"MARCE",
      email:"MARCE@TEST.COM",
      roles:['administrator']};
    let userIdB = Accounts.createUser({
      email: userB.email,
      username: userB.name,
      password: userB.password,
      profile: { name: userB.name }
    });
    Roles.addUsersToRoles(userIdB, userB.roles, 'default-group');
    
    let userC = {
      name:"B",
      password:"B",
      email:"B@B.COM",
      roles:['supervisor']};
    let userIdC = Accounts.createUser({
      email: userC.email,
      username: userC.name,
      password: userC.password,
      profile: { name: userC.name }
    });
    Roles.addUsersToRoles(userIdC, userC.roles, 'default-group');
    
    let userD = {
      name:"VENDEDOR",
      password:"VENDEDOR",
      email:"VENDEDOR@TEST.COM",
      roles:['seller']};
    let userIdD = Accounts.createUser({
      email: userD.email,
      username: userD.name,
      password: userD.password,
      profile: { name: userD.name }
    });
    Roles.addUsersToRoles(userIdD, userD.roles, 'default-group');
    
    let userE = {
      name:"DEFAULT",
      password:"DEFAULT",
      email:"DEFAULT@TEST.COM",
      roles:['anonymous']};
    let userIdE = Accounts.createUser({
      email: userE.email,
      username: userE.name,
      password: userE.password,
      profile: { name: userE.name }
    });
    Roles.addUsersToRoles(userIdE, userE.roles, 'default-group');
    
    // var user_id_0 = Accounts.createUser(users[0]);
    // Meteor.users.update(user_id_0, {
    //     $set: { "emails.0.verified": true}
    // });  
  
    // var user_id_1 = Accounts.createUser(users[1]);
    // Meteor.users.update(user_id_1, {
    //     $set: { "emails.0.verified": true}
    // });

    // var user_id_2 = Accounts.createUser(users[2]);
    // Meteor.users.update(user_id_2, {
    //     $set: { "emails.0.verified": true}
    // });  


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

    // // 1: purchases
    Purchases.insert({
       _id: "01",
      purchaseNumber: 1,
      purchaseState: "SELECTION",
      createdAt: new Date(2016, 7, 10, 11, 23),
      lastUpdate: new Date(2016, 7, 10, 21, 23),
      provider:"JUAN",
      paymentAmount:0
    });
    Purchases.insert({
       _id: "02",
      purchaseNumber: 2,
      purchaseState: "VERIFICATION",
      createdAt: new Date(2016, 7, 10, 12, 23),
      lastUpdate: new Date(2016, 7, 10, 21, 23),
      provider:"ANDRES",
      paymentAmount:1000
    });
    Purchases.insert({
       _id: "03",
      purchaseNumber: 3,
      purchaseState: "CANCELED",
      createdAt: new Date(2017, 1, 10, 11, 23),
      lastUpdate: new Date(2017, 1, 10, 11, 23),
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
  
    // 2 balance, valid status: // OPEN // CLOSE
    Balances.insert({
      _id: "01",
      balanceNumber: 1,
      cashExistence: 500, 
      createdAt: new Date(2017, 1, 10, 11, 23),
      lastUpdate: new Date(2017, 1, 19, 11, 23),
      storeId: "03",
      status: "CLOSED"
    });
    Balances.insert({
      _id: "02",
      balanceNumber: 2,
      cashExistence: 500,
      createdAt: new Date(2017, 1, 9, 11, 23),
      storeId: "01",
      status: "OPEN",
    });
    Balances.insert({
      _id: "03",
      balanceNumber: 3,
      cashExistence: 1500,
      createdAt: new Date(2017, 1, 9, 11, 25),
      storeId: "02",
      status: "OPEN"
    });

    BalanceOperations.insert({
      _id: "01",
      amount: 1000,
      balanceId: "03",
      createdAt: new Date(2017, 1, 9, 12, 25),
      operationType: "EXTRACTION"
    });

    BalanceOperations.insert({
      _id: "02",
      amount: 100,
      balanceId: "02",
      createdAt: new Date(2017, 1, 9, 12, 27),
      operationType: "DEPOSIT"
    });

    // 2: user stores
    UserStores.insert({
      _id: "01",
      userId: userIdA,
      storeId: "01"
    });
    UserStores.insert({
      _id: "02",
      userId: userIdB,
      storeId: "02"
    });
    UserStores.insert({
      _id: "03",
      userId: userIdC,
      storeId: "01"
    });
    UserStores.insert({
      _id: "04",
      userId: userIdC,
      storeId: "02"
    });
    UserStores.insert({
      _id: "05",
      userId: userIdC,
      storeId: "03"
    });

    // // 3: products
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
   
    // // 3: sales
    // // check the balance is in open status 
    // // on current date before sale creations
    Sales.insert({
      _id: "01",
      saleNumber: 1,
      saleState: "STARTED",
      payment: "CASH",
      workShift: "MORNING",
      createdAt: new Date(2017, 2, 23, 12, 25),
      lastUpdate: new Date(2017, 2, 23, 12, 25),
      userStoreId: "01", 
      balanceId: "02"
    });
    Sales.insert({
      _id: "02",
      saleNumber: 2,
      saleState: "STARTED",
      payment: "CASH",
      workShift: "MORNING",
      createdAt: new Date(2017, 2, 23, 18, 25),
      lastUpdate: new Date(2017, 2, 23, 19, 25),
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

    // // 4: settings product prices
    ProductPrices.insert({
      _id: "01",
      createdAt: new Date(2017, 2, 23, 12, 25),
      active: true,
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
      createdAt: new Date(2017, 2, 23, 12, 25),
      active: true,
      lastCostPrice: 100,
      priceCash: 250,
      priceCard: 220,
      productId: "03",
      storeId: "01"
    });
    ProductPrices.insert({
      _id: "03",
      createdAt: new Date(2017, 2, 23, 12, 25),
      active: true,
      lastCostPrice: 22,
      priceCash: 300,
      priceCard: 210,
      productId: "02",
      storeId: "01"
    });
    ProductPrices.insert({
      _id: "04",
      createdAt: new Date(2017, 2, 23, 12, 25),
      active: true,
      lastCostPrice: 50,
      priceCash: 100,
      priceCard: 150,
      productId: "02",
      storeId: "02"
    });

    // //5: stocks 
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

    // // 5: sales entries
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

    // // 6: update purchase information
    ProductPurchases.update(
      {_id: "01"},
      {$set:{total: 15000}}
    );

    // // 6: update balance test
    // Balances.insert({
    //   _id: "03",
    //   balanceNumber: "000004",
    //   storeId: "01",
    //   cashExistence: 500,
    //   cashFlow: -100,
    //   operation: "EXTRACTION", // OPEN // CLOSE // EXTRACTION // DEPOSIT
    //   actionDate: "2017-01-13T9:32:01Z"
    // }); 
    // Balances.insert({
    //   _id: "04",
    //   balanceNumber: "000005",
    //   storeId: "01",
    //   cashExistence: 400,
    //   cashFlow: 50,
    //   operation: "DEPOSIT", // OPEN // CLOSE // EXTRACTION // DEPOSIT
    //   actionDate: "2017-01-14T10:13:01Z"
    // });

    // //started submitted reserved
    // Sales.update({_id:"01"},{
    //   $set: { 
    //     saleState: "STARTED",
    //     subtotal: 930,
    //     taxes: 195.3,
    //     total: 1125.3,
    //     lastUpdate: "2017-02-23 18:27:32"
    //   }
    // });

    // // update local stock(before submit)
    Stocks.update({ _id: "01" },{$dec: { quantity: 1 }});
    Stocks.update({ storeId: "01", productSizeId: "03" },{$dec: { quantity: 2 }});
    Stocks.update({ storeId: "01", productSizeId: "05" },{$dec: { quantity: 1 }});

    // //check the balance is open before submit
    // //update the balance to contain submitted sale information
    // Balances.update(
    //   {storeId: "01", sort: {actionDate: -1}, limit: 1},
    //   {$set:{$inc: {cashFlow: 1125.3, cashExistence: 400}}}
    // );

    // // to the end of day close the balance
    // Balances.insert({
    //   _id: "04",
    //   balanceNumber: "000006",
    //   storeId: "01",
    //   cashExistence: 1125.3,
    //   operation: "CLOSE", // OPEN // CLOSE // EXTRACTION // DEPOSIT
    //   actionDate: "2017-02-12T19:32:01Z"
    // });


    // const tags = [
    //   { "_id" : "T2J6jxM7xWBGfJ66K", "code" : "00", "type" : "section", "description" : "ACTIVE" },
    //   { "_id" : "4ZRkrD9hT62TXj9er", "code" : "01", "type" : "color", "description" : "AZUL" },
    //   { "_id" : "vF9Twf7ewEfWDpQvL", "code" : "02", "type" : "provider", "description" : "JUAN" },
    //   { "_id" : "HWNPFJp2qnqqKHkKv", "code" : "00", "type" : "color", "description" : "ACTIVE" },
    //   { "_id" : "nCvWjwXbcrwnp99mg", "code" : "01", "type" : "brand", "description" : "ANIMAL" },
    //   { "_id" : "cJGCSfZbE3DmEkctP", "code" : "01", "type" : "provider", "description" : "ANDRES" },
    //   { "_id" : "xzBdqsx88aT4f5vpK", "code" : "00", "type" : "model", "description" : "ACTIVE" },
    //   { "_id" : "ww73PsjaPG4epQW3D", "code" : "00", "type" : "brand", "description" : "ACTIVE" },
    //   { "_id" : "TyQbubFBzBuGTethL", "code" : "01", "type" : "model", "description" : "UNIVERSAL" },
    //   { "_id" : "aMxvYvfYuCX5yiQLz", "code" : "03", "type" : "section", "description" : "NIÑO" },
    //   { "_id" : "ayotRuhPkoNTGeGCG", "code" : "01", "type" : "name", "description" : "BERMUDA GYM" },
    //   { "_id" : "KY2WmfQDX975aYt6A", "code" : "02", "type" : "section", "description" : "CABALLERO" },
    //   { "_id" : "xbNffp36honCBWoge", "code" : "00", "type" : "name", "description" : "ACTIVE" },
    //   { "_id" : "6tpKRhMcvXMACAfcx", "code" : "00", "type" : "provider", "description" : "ACTIVE" },
    //   { "_id" : "WwyAcBeDKDCPzpxwW", "code" : "01", "type" : "section", "description" : "DAMA" },
    //   { "_id" : "E6g532W4LcMeGtEf8", "code" : "11", "type" : "name", "description" : "PANTALON ALGODON" },
    //   { "_id" : "iqwP5po4iEC2dZ365", "code" : "11", "type" : "model", "description" : "FRIZA" },
    //   { "_id" : "SntfPQqsuFgecrjqr", "code" : "11", "type" : "color", "description" : "GRIS" },
    //   { "_id" : "S99HHQqBP4R4SjiNR", "code" : "11", "type" : "brand", "description" : "GENERICO" },
    //   { "_id" : "sEPHWQ44taEoCTHdf", "code" : "12", "type" : "color", "description" : "MARINO" }
    // ];
    // tags.forEach((tag) => Tags.insert(tag));

    // const products = [
    //   { "_id" : "oyE9jkW7peeieDfPx", "name" : "PANTALON ALGODON", "color" : "GRIS", "brand" : "GENERICO", "model" : "FRIZA", "provider" : "JUAN", "categoryId" : "02", "code" : "1111111102" },
    //   { "_id" : "bDjrLj9evTrZToLvY", "name" : "PANTALON ALGODON", "color" : "MARINO", "brand" : "GENERICO", "model" : "FRIZA", "provider" : "JUAN", "categoryId" : "02", "code" : "1111121102" },
    //   { "_id" : "QpcDBvvdx8qxezBNJ", "name" : "PANTALON ALGODON", "color" : "TOPO", "brand" : "GENERICO", "model" : "FRIZA", "provider" : "JUAN", "categoryId" : "02", "code" : "1111131102" },
    // ];
    // products.forEach((product) => Products.insert(product));

    // const sales = [
    //   { "_id" : "nCmZGEYNGRFTvtwa9", "saleNumber" : 11, "saleState" : "SUBMITTED", "payment" : "", "saleDate" : "2017-03-23 19:54:16", "lastUpdate" : "2017-03-23 19:54:16", "workShift" : "AFTERNOON", "userStoreId" : "01", "balanceId" : "10", "discount" : 0, "taxes" : 0, "subtotal" : 0, "total" : 0 }
    // ];
    // sales.forEach((sale) => Sales.insert(sale));

    // const productSizes = [
    //   { "_id" : "6ZjAkvoojykg7PN6Y", "productId" : "oyE9jkW7peeieDfPx", "size" : "S", "barCode" : "1111111102700" },
    //   { "_id" : "vXDjbE6Bai2aFWfcG", "productId" : "oyE9jkW7peeieDfPx", "size" : "M", "barCode" : "1111111102701" },
    //   { "_id" : "Yh3Df7fDjfE7czzvo", "productId" : "oyE9jkW7peeieDfPx", "size" : "L", "barCode" : "1111111102702" },
    //   { "_id" : "cWFt2hnKC84SGsEGq", "productId" : "oyE9jkW7peeieDfPx", "size" : "XL", "barCode" : "1111111102703" },
    //   { "_id" : "EavnKzDACr5Meqhb5", "productId" : "bDjrLj9evTrZToLvY", "size" : "S", "barCode" : "1111121102700" },
    //   { "_id" : "byXML7uKE2aJTnK3C", "productId" : "bDjrLj9evTrZToLvY", "size" : "M", "barCode" : "1111121102701" },
    //   { "_id" : "G8fanP2Q54iGRRJzt", "productId" : "bDjrLj9evTrZToLvY", "size" : "L", "barCode" : "1111121102702" },
    //   { "_id" : "B9tAtexgDjwRdX5v8", "productId" : "bDjrLj9evTrZToLvY", "size" : "XL", "barCode" : "1111121102703" },
    //   { "_id" : "TtuxwcQKdaepZ5uoT", "productId" : "QpcDBvvdx8qxezBNJ", "size" : "S", "barCode" : "1111131102700" },
    //   { "_id" : "j9jnfEWRdo27pxMw9", "productId" : "QpcDBvvdx8qxezBNJ", "size" : "M", "barCode" : "1111131102701" },
    //   { "_id" : "kgXcMEQekpWExBS5W", "productId" : "QpcDBvvdx8qxezBNJ", "size" : "L", "barCode" : "1111131102702" },
    //   { "_id" : "KXzFyYrYF4JbAgZBd", "productId" : "QpcDBvvdx8qxezBNJ", "size" : "XL", "barCode" : "1111131102703" },
    //   { "_id" : "3tHHXzhBSH7eAvSm2", "productId" : "QpcDBvvdx8qxezBNJ", "size" : "XXL", "barCode" : "1111131102704" },
    // ];  
    // productSizes.forEach((sizes) => ProductSizes.insert(sizes));

    // const productPrices = [
    //   { "_id" : "5PqKEBqfM2u4sicBh", "lastCostPrice" : 160, "priceCash" : 300, "priceCard" : 300, "productId" : "oyE9jkW7peeieDfPx", "storeId" : "01" },
    //   { "_id" : "daaGDjSwBpnjj3YrN", "lastCostPrice" : 150, "priceCash" : 300, "priceCard" : 300, "productId" : "oyE9jkW7peeieDfPx", "storeId" : "02" },
    //   { "_id" : "ZL68zGR6hThvtLmQg", "lastCostPrice" : 150, "priceCash" : 300, "priceCard" : 300, "productId" : "oyE9jkW7peeieDfPx", "storeId" : "03" },
    //   { "_id" : "Aaozh6pYJzcJWuQuK", "lastCostPrice" : 157, "priceCash" : 300, "priceCard" : 300, "productId" : "bDjrLj9evTrZToLvY", "storeId" : "01" },
    //   { "_id" : "TpQuSgAR2zZziCzCc", "lastCostPrice" : 150, "priceCash" : 300, "priceCard" : 300, "productId" : "bDjrLj9evTrZToLvY", "storeId" : "02" },
    //   { "_id" : "BtHRp79TFNNkoj9B9", "lastCostPrice" : 150, "priceCash" : 300, "priceCard" : 300, "productId" : "bDjrLj9evTrZToLvY", "storeId" : "03" },
    //   { "_id" : "ipQd8numeBJzoEiZb", "lastCostPrice" : 155, "priceCash" : 300, "priceCard" : 300, "productId" : "QpcDBvvdx8qxezBNJ", "storeId" : "01" },
    //   { "_id" : "SLnza3KrFxBBjM6FX", "lastCostPrice" : 150, "priceCash" : 300, "priceCard" : 300, "productId" : "QpcDBvvdx8qxezBNJ", "storeId" : "02" },
    //   { "_id" : "LYvY2hEmgoepAEksv", "lastCostPrice" : 150, "priceCash" : 300, "priceCard" : 300, "productId" : "QpcDBvvdx8qxezBNJ", "storeId" : "03" },
    // ];
    // productPrices.forEach((price) => ProductPrices.insert(price));
   
    // const stocks = [
    //   { "_id" : "f4KQZTiTXFL2sk8N7", "productSizeId" : "6ZjAkvoojykg7PN6Y", "storeId" : "01", "quantity" : 3, "active" : true },
    //   { "_id" : "RLmG3Ld3aTQhAwPjG", "productSizeId" : "6ZjAkvoojykg7PN6Y", "storeId" : "02", "quantity" : 3, "active" : true },
    //   { "_id" : "2kxZtusBR5AjPk4i6", "productSizeId" : "6ZjAkvoojykg7PN6Y", "storeId" : "03", "quantity" : 1, "active" : true },
    //   { "_id" : "3Nq2Kw7B8M5EDdhv2", "productSizeId" : "vXDjbE6Bai2aFWfcG", "storeId" : "01", "quantity" : 3, "active" : true },
    //   { "_id" : "3fW65dae5imczdKWL", "productSizeId" : "vXDjbE6Bai2aFWfcG", "storeId" : "02", "quantity" : 4, "active" : true },
    //   { "_id" : "NGGXapxTh4cEHXC5N", "productSizeId" : "vXDjbE6Bai2aFWfcG", "storeId" : "03", "quantity" : 5, "active" : true },
    //   { "_id" : "ryPTs85CPzASXjNQm", "productSizeId" : "Yh3Df7fDjfE7czzvo", "storeId" : "01", "quantity" : 3, "active" : true },
    //   { "_id" : "RDeLH4gQDKJmNqCSX", "productSizeId" : "Yh3Df7fDjfE7czzvo", "storeId" : "02", "quantity" : 3, "active" : true },
    //   { "_id" : "h5yPQ8RRobJ9EDfaX", "productSizeId" : "Yh3Df7fDjfE7czzvo", "storeId" : "03", "quantity" : 4, "active" : true },
    //   { "_id" : "HtknHDxgT5vhXQDsA", "productSizeId" : "cWFt2hnKC84SGsEGq", "storeId" : "01", "quantity" : 4, "active" : true },
    //   { "_id" : "u67wcgJQMWnXunK77", "productSizeId" : "cWFt2hnKC84SGsEGq", "storeId" : "02", "quantity" : 3, "active" : true },
    //   { "_id" : "gxW79EGz28Hqf9Bit", "productSizeId" : "cWFt2hnKC84SGsEGq", "storeId" : "03", "quantity" : 3, "active" : true },
    //   { "_id" : "PMPoJkRHwuGm2wDwA", "productSizeId" : "EavnKzDACr5Meqhb5", "storeId" : "01", "quantity" : 3, "active" : true },
    //   { "_id" : "o3id4646Sud4mWvBo", "productSizeId" : "EavnKzDACr5Meqhb5", "storeId" : "02", "quantity" : 3, "active" : true },
    //   { "_id" : "4QNSBmgzJvfLQvnFt", "productSizeId" : "EavnKzDACr5Meqhb5", "storeId" : "03", "quantity" : 4, "active" : true },
    //   { "_id" : "bf7u6qifMiubqQTme", "productSizeId" : "byXML7uKE2aJTnK3C", "storeId" : "01", "quantity" : 2, "active" : true },
    //   { "_id" : "Jvvc2iNBf2jDET6fT", "productSizeId" : "byXML7uKE2aJTnK3C", "storeId" : "02", "quantity" : 3, "active" : true },
    //   { "_id" : "hCugTSJCLYSFDfTBe", "productSizeId" : "byXML7uKE2aJTnK3C", "storeId" : "03", "quantity" : 4, "active" : true },
    //   { "_id" : "4e96nXdT3Enzgzt9X", "productSizeId" : "G8fanP2Q54iGRRJzt", "storeId" : "01", "quantity" : 3, "active" : true },
    //   { "_id" : "u6qCY7WTzXkHxLQzW", "productSizeId" : "G8fanP2Q54iGRRJzt", "storeId" : "02", "quantity" : 3, "active" : true },
    // ];
    // stocks.forEach((stock) => Stocks.insert(stock));

    // const productSales = [
    //   { "_id" : "oLZAgDwCmMgXAvzRm", "productSizeId" : "vXDjbE6Bai2aFWfcG", "saleId" : "nCmZGEYNGRFTvtwa9", "quantity" : 1 },
    //   { "_id" : "kK3nKStREa584XxZT", "productSizeId" : "byXML7uKE2aJTnK3C", "saleId" : "nCmZGEYNGRFTvtwa9", "quantity" : 1 },
    //   { "_id" : "JiSMaN3rwcxsp6GGG", "productSizeId" : "TtuxwcQKdaepZ5uoT", "saleId" : "nCmZGEYNGRFTvtwa9", "quantity" : 1 },
    // ];
    // productSales.forEach((productSale) => ProductSales.insert(productSale));
  
  }
}