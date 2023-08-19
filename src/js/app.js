import { settings, select, classNames } from "./settings.js";
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {

      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {

        const clikedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clikedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activePage with that id */

        thisApp.activatePage(id);

        /* change url hash */
        window.location.hash = '#/' + id;

      });
    }

  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class active to matching pages, remove from non-matching*/
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);

    }

    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);

    }

    /* add class active to matching pages, remove from non-matching*/

  },

  initMenu: function () {

    const thisApp = this;

    for (let productData in thisApp.data.products) {

      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () { //access to data from dataSource
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parasedResposne) {
        /* save parasedResposne as thisApp.data.products*/
        thisApp.data.products = parasedResposne;

        /* execute initMenu method*/
        thisApp.initMenu();
      });
  },
  init: function () { //method init
    const thisApp = this;

    thisApp.initData(); //ma zadanie przygotować nam łatwy dostęp do danych. Przypisuje więc do app.data (właściwości całego obiektu app) referencję do dataSource

    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem)

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);

    })

  },
  initBooking: function () {

    const thisApp = this;
    const containerBooking = document.querySelector(select.containerOf.booking);

    thisApp.Booking = new Booking(containerBooking);

  },
};
app.init();


