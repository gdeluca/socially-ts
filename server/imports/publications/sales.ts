import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

// collections
// import { Balances } from '../../../both/collections/balances.collection';
// import { Categories } from '../../../both/collections/categories.collection';
// import { Counters } from '../../../both/collections/counters.collection';
import { UserStores } from '../../../both/collections/user-stores.collection';
// import { ProductPurchases } from '../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../both/collections/product-sizes.collection';
import { Products } from '../../../both/collections/products.collection';
// import { Purchases } from '../../../both/collections/purchases.collection';
import { Sales } from '../../../both/collections/sales.collection';
// import { Sections } from '../../../both/collections/sections.collection';
import { Stocks } from '../../../both/collections/stocks.collection';
import { Stores } from '../../../both/collections/stores.collection';
// import { Tags } from '../../../both/collections/tags.collection';
// import { Users } from '../../../both/collections/users.collection';

// // model 
// import { Balance } from '../../../both/models/balance.model';
// import { Category } from '../../../both/models/category.model';
// import { Counter } from '../../../both/models/counter.model';
// import { UserStore } from '../../../both/models/user-store.model';
// import { ProductPurchase } from '../../../both/models/product-purchase.model';
// import { ProductSale } from '../../../both/models/product-sale.model';
// import { ProductSize } from '../../../both/models/product-size.model';
// import { Product } from '../../../both/models/product.model';
// import { Purchase } from '../../../both/models/purchase.model';
// import { Sale } from '../../../both/models/sale.model';
// import { Section } from '../../../both/models/section.model';
// import { Stock } from '../../../both/models/stock.model';
// import { Store } from '../../../both/models/store.model';
// import { Tag } from '../../../both/models/tag.model';
// import { User } from '../../../both/models/user.model';

import { SearchOptions } from '../../../both/search/search-options';

Meteor.publishComposite('sales', function(saleNumber: string, options: SearchOptions) {
  return {
    find: function() {
      return Sales.collection.find({ saleNumber: saleNumber }, options);
    },
    children: [
      {
        find: function(sale) {
          return ProductSales.collection.find({ saleId: sale._id });
        },
        children: [
          {
            find: function(productSale) {
              return ProductSizes.collection.find({ _id: productSale.productSizeId });
            },
            children: [
              {
                find: function(productSize) {
                  return Products.collection.find({ _id: productSize.productId });
                },
                children: [
                  { 
                    find: function(productSize) {
                      return Stocks.collection.find({ productSizeId: productSize._id});
                    }
                  }
                ]
              }
            ]
          }
        ]
      },  
      {  
        find: function(sale) {
          return UserStores.collection.find({ _id: sale.userStoreId });
        },
        children: [
          {
            find: function(userStore) {
              return Stores.collection.find({ _id: userStore.storeId });
            }
          }
        ]
      }
    ]
  }
});



