import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import { ProductSizes, getMappingSize } from '../collections/product-sizes.collection';
import { ProductPrices } from '../collections/product-prices.collection';
import { Products } from '../collections/products.collection';
import { Stores } from '../collections/stores.collection';
import { Stocks } from '../collections/stocks.collection';
import { Store } from '../models/store.model';


Meteor.methods({

  saveStocksForStores: function (productSizeIds: string[], storeIds: string[], quantity: number) {
    check(productSizeIds, [String]);
    check(storeIds, [String]);
    check(quantity, Number);
    return productSizeIds.map((productSizeId) => {
      return storeIds.map((storeId) => {
        return Stocks.collection.insert({
          quantity: quantity,
          storeId: storeId,
          active: true,
          productSizeId: productSizeId
        });
      })
    });
  },

  saveStock: function (values:any) {
    check(values.size, String);
    check(values.barCode, String);
    check(values.size, String);


    // last two characters are reserved for product size
    let productCode =  values.barCode.substring(0, 10);
    let size = values.size.toUpperCase();
    let barCode = productCode + getMappingSize(values.size);

    console.log('looking for product with code: ', productCode);
    // find a product
    let product = Products.findOne({code: productCode});
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
              lastCostPrice: +values.cost,
              priceCash: +values.cashPayment,
              priceCard: +values.cardPayment,
              rateCash: (+values.cashPayment/(+values.cost))*100,
              rateCard: (+values.cardPayment/(+values.cost))*100,
            }
          })
          console.log('productPrice updated: ', JSON.stringify(productPrice));
        } else {
          let productPriceId = ProductPrices.insert({
            lastCostPrice: +values.cost,
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
          lastCostPrice: +values.cost,
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
