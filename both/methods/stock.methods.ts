import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// import { Balances } from '../collections/balances.collection';
import { ProductPurchases } from '../collections/product-purchases.collection';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';

// import { Purchases } from '../collections/purchases.collection';
import { Products } from '../collections/products.collection';
import { Stocks } from '../collections/stocks.collection';
import { Stores } from '../collections/stores.collection';
// import { Categories } from '../collections/categories.collection';
// import { Counters } from '../collections/counters.collection';
// import { UserStores } from '../collections/user-stores.collection';
// import { ProductSales } from '../collections/product-sales.collection';
// import { Sales } from '../collections/sales.collection';
// import { Tags } from '../collections/tags.collection';
// import { Users } from '../collections/users.collection';

// model 
import { ProductPurchase } from '../models/product-purchase.model';
import { ProductPrice } from '../models/product-price.model';
import { ProductSize } from '../models/product-size.model';
import { Product } from '../models/product.model';
import { Stock } from '../models/stock.model';
import { Store } from '../models/store.model';
// import { Balance } from '../models/balance.model';
// import { Category } from '../models/category.model';
// import { Purchase } from '../models/purchase.model';
// import { Counter } from '../models/counter.model';
// import { UserStore } from '../models/user-store.model';
// import { ProductSale } from '../models/product-sale.model';
// import { Sale } from '../models/sale.model';
// import { Tag } from '../models/tag.model';
// import { User } from '../models/user.model';

Meteor.methods({

  upsertStock: function(
    productSizeId: string,
    storeId: string,
    quantity: number,
    active:boolean = true
  ) {
    check(storeId, String);
    check(productSizeId, String);
    check(quantity, Number);
    check(active, Boolean);
    let stock = Stocks.findOne({storeId:storeId, productSizeId:productSizeId, active:true});
    if (stock) {
      return Stocks.collection.update(stock._id, 
        { $set: { quantity:quantity }}
      );
    } else {
      return Stocks.collection.insert({
        productSizeId: productSizeId,
        storeId: storeId,
        quantity: quantity,
        active: active
      });
    }
  },

  bulkSaveStockForStores: function(
    productSizeIds: string[], 
    storeIds: string[], 
    quantity: number
  ): string[] {
    if (Meteor.isServer) {
      check(productSizeIds, [String]);
      check(storeIds, [String]);
      check(quantity, Number);
      console.log('enter saving');
      let productsSizes = ProductSizes.collection.find(
        {_id: {$in: productSizeIds}}, {fields: {_id: 1}}).fetch();
      if (productsSizes.length != productSizeIds.length) {
         throw new Meteor.Error('400', 
            'No coinciden las cantidades de talles; se esperaban: ' +
            productSizeIds.length + ' y existen: ' + productsSizes.length );
      }
      
      let stores = Stores.collection.find(
        {_id: {$in: storeIds}}, {fields: {_id: 1}}).fetch();
      if (stores.length != storeIds.length) {
        throw new Meteor.Error('400', 
            'No las cantidades de sucursales; se esperaban: ' +
            storeIds.length + ' y existen: ' + stores.length );
      }
          
      const rawCollection = Stocks.rawCollection();
      const bulk = rawCollection.initializeUnorderedBulkOp();
      let response = {};
      productSizeIds.forEach(productSizeId => 
        storeIds.forEach(storeId => {
          console.log(storeId,productSizeId);
          response["$or"] = []
          response["$or"].push(
            { storeId: storeId, productSizeId: productSizeId}, 
            {fields: {_id: 1}}
          );

          bulk.insert({
            _id: Random.id(),
            productSizeId: productSizeId,
            storeId: storeId,
            quantity: quantity,
            active: true
          })

        })
      )
      bulk.execute(function(error, results) {
        if(error) {
          throw new Meteor.Error('400', 
            'Fallo al agregar el stock: ' + error);
        }
      });

      return Stocks.collection.find(response)
        .fetch().map(stock => {return stock._id});
    }
  },

  bulkUpdateStockQuantities: function (
    productSizeIds: string[],
    storeIds: string[],
    quantities: any,
  ) {

    if (Meteor.isServer) {
      check(productSizeIds, [String]);
      check(storeIds, [String]);
      check(quantities, Match.Any); // TODO: replace Match.Any
      const rawCollection = Stocks.collection.rawCollection();
      const bulk = rawCollection.initializeUnorderedBulkOp();

      productSizeIds.map(productSizeId => 
        storeIds.map(storeId => {
          let stock = Stocks.findOne(
            {productSizeId:productSizeId, storeId:storeId});
          
          if (stock) {
            // console.log(+stock.quantity + +quantities[productSizeId + storeId]);
            bulk.find({_id:stock._id}).update({
              $set: { 
               quantity: +stock.quantity + +quantities[productSizeId + storeId],
              }
            })
          } else {
          // console.log(
          //     {productSizeId:productSizeId, 
          //     storeId:storeId,
          //     quantity: +quantities[productSizeId + storeId]
          //   });

            bulk.insert({
              _id: Random.id(),
              productSizeId:productSizeId, 
              storeId:storeId,
              quantity: +quantities[productSizeId + storeId]
            })
          }
        })
      )

      bulk.execute(function(error,results) {
        if(error) {
           throw new Meteor.Error('400', 
            'Fallo al actualizar el stock: ' + error);
        }
        console.log(results);
      });

    }
  },

  addStoreToStockAndPrice: function(
    storeId: string
  ) {
    ProductSizes.find()
    .flatMap(function(productSizes) { return productSizes })
    .distinct()
    .subscribe((productSize) => {
      return Meteor.call("upsertStock", productSize._id, storeId, 0);  
    });

   Products.find()
    .flatMap(function(products) { return products })
    .distinct()
    .subscribe((product) => {
      // return the prices from any store 
      let price = ProductPrices.findOne(
        {productId: product._id}, {fields: {_id: 1}});
      if (price) {
        Meteor.call("addProductPrice",
          price.cost,
          price.priceCash,
          price.priceCard,
          product._id,
          storeId,
          price.rateCash,
          price.rateCard
        );
      } else {
        Meteor.call("addProductPrice",
          0,
          product._id,
          storeId,
          0,
          0
        );
      }
    });
  }, 


// TODO: review stocks
  saveStock: function (
    values:any
  ) {
    check(values.size, String);
    check(values.barCode, String);
    check(values.size, String);

    // last two characters are reserved for product size
    let productCode =  values.barCode.substring(0, 10);
    let size = values.size.toUpperCase();
    let barCode = productCode + getMappingSize(values.size);

    console.log('looking for product with code: ', productCode);
    // find a product
    let product = Products.findOne(
      {code: productCode}, {fields: {_id: 1}});
    if (product) {
        // if exists update the product information
      Products.update(product._id, {
          $set: { 
            name: values.name,
            color: values.color,
            provider: values.provider,
            categoryId: values.category._id
          }
      });
      console.log('product updated', JSON.stringify(product))

      // find or insert the product size information
      console.log('looking for productSize with: ', {productId: product._id, size: size});
      let productSize = ProductSizes.findOne(
        {productId: product._id, size: size, barCode: barCode}
      );
      let productSizeId = '';
      if (productSize) {
        console.log('productSize found', JSON.stringify(productSize));
        productSizeId = productSize._id;
      } else {
        productSizeId = ProductSizes.collection.insert(
          {productId: product._id, size: size, barCode: barCode}
        );
        console.log('productSize created, new id is:', productSizeId)
      }

      let stores = Stores.find({}).fetch();
      stores.forEach(function(store: Store) {
        
        // update or insert the stocks for each stores
        let stock = Stocks.findOne(
          {productSizeId: productSizeId, storeId: store._id, active: true}
        ); 
        if (stock) { 
          console.log('stock found, nothing to do', JSON.stringify(stock));
        } else {
          Stocks.insert({
            quantity: 0,
            storeId: store._id,
            active: true,
            productSizeId: productSizeId
          })
          console.log('stock created', JSON.stringify(stock));
        }

        // update or insert the productprices for each stores 
        let productPrice = ProductPrices.findOne(
          {productId: product._id, storeId: store._id}
        );
        if (productPrice) { 
          ProductPrices.update(stock._id, {
            $set: { 
              cost: +values.cost,
              priceCash: +values.cashPayment,
              priceCard: +values.cardPayment,
              rateCash: (+values.cashPayment/(+values.cost))*100,
              rateCard: (+values.cardPayment/(+values.cost))*100,
            }
          })
          console.log('productPrice updated: ', JSON.stringify(productPrice));
        } else {
          let productPriceId = ProductPrices.insert({
            createdAt: new Date(),
            active: true,
            cost: +values.cost,
            priceCash: +values.cashPayment,
            priceCard: +values.cardPayment,
            rateCash: (+values.cashPayment/(+values.cost))*100,
            rateCard: (+values.cardPayment/(+values.cost))*100,
            storeId: store._id,
            productId: product._id
          })
          console.log('productPrice created: ', productPriceId);
        }
      });

    } else {
      // the product is missed, create a new one
      let productId = Products.collection.insert({
        code: productCode,
        name: values.name,
        color: values.color,
        brand: values.brand,
        model: values.model,
        provider: values.provider,
        categoryId: values.category._id
      });
      console.log('product created with id: ', productId)

      // insert the product size information
      let productSizeId = ProductSizes.collection.insert(
          {productId: productId, size: size, barCode: barCode}
      );
      
      let stores = Stores.find({}).fetch();

      // insert the stocks related to all the stores
      stores.forEach(function(store: Store){
        console.log('inseting stock for store: ',store);

        Stocks.insert({
          quantity: 0,
          storeId: store._id,
          active: true,
          productSizeId: productSizeId
        });
        console.log('stock created');

        ProductPrices.insert({
          createdAt: new Date(),
          active: true,
          cost: +values.cost,
          priceCash: +values.cashPayment,
          priceCard: +values.cardPayment,
          rateCash: (+values.cashPayment/(+values.cost))*100,
          rateCard: (+values.cardPayment/(+values.cost))*100,
          storeId: store._id,
          productId: productId
        })
        console.log('productPrice created');

      })
    }
  }

});
