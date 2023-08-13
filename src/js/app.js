import { settings, select } from "./settings.js";
import Product from './components/Product.js';
import Cart from './components/Cart.js';


const app = {

  initMenu: function(){ //method initMenu

    const thisApp = this;

    for(let productData in thisApp.data.products){

      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){ //access to data from dataSource
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function( parasedResposne){
        /* save parasedResposne as thisApp.data.products*/
        thisApp.data.products =  parasedResposne ;

        /* execute initMenu method*/
        thisApp.initMenu();
      });
    },
  init: function(){ //method init
    const thisApp = this;

    thisApp.initData(); //ma zadanie przygotować nam łatwy dostęp do danych. Przypisuje więc do app.data (właściwości całego obiektu app) referencję do dataSource

    thisApp.initCart();
  },
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem)

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);

    })

  },

};

 app.init();


