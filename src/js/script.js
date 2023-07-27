/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

 /* const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };*/

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  class Product{
    constructor(id, data){
      const thisProduct = this; //  this jest odnośnikiem do obiektu, który jest utworzony przez klasę podczas inicjacji, a więc w momencie uruchomienia instrukcji new Product.  Zapisując właściwości do thisProduct, przypiszemy je więc po prostu do danej instancji.

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); // Zadba o to, by nasz konstruktor uruchomił tę funkcję od razu po utworzeniu instancji.
      //console.log('new Product: ', thisProduct);
      thisProduct.getElements();
      thisProduct.initAccordion(); //uruchamia accordion

    }

      renderInMenu(){
        const thisProduct = this; // metoda która bedzie renderować ( tworzyc produkty na stronie)

        /* generate HTML based on temaplte */
        const generatedHTML = templates.menuProduct(thisProduct.data);
        //console.log('generatedHTML : ', generatedHTML);

        /* create element using utilies.createElementFromHTML*/
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        console.log('!!!!!!!!!!!!!!!!', thisProduct.element);
        /* find menu container */
        const menuConatiner = document.querySelector(select.containerOf.menu);


        /* add element to menu */
        menuConatiner.appendChild(thisProduct.element);

  }
  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  }

  initAccordion(){

    const thisProduct = this;
    console.log('thisProduct ' , thisProduct );


    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    console.log('clickableTrigger : ', clickableTrigger);

    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */
        event.preventDefault();

      /* find active product (product that has active class) */

      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      console.log('activeProducts' , activeProducts);

      /* if there is active product and it's not thisProduct.element,
      remove class active from it */


      for(let activeProduct of activeProducts){

        if (activeProduct !== thisProduct.element) {
             activeProduct.classList.remove('active');
            console.log(activeProduct);
        }
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active')

    });
  }
}
  const app = {

    initMenu: function(){ //method initMenu

      const thisApp = this;
      //console.log('thisApp.data :', thisApp.data);

      for(let productData in thisApp.data.products){

        new Product( productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){ //access to data from dataSource
      const thisApp = this;

      thisApp.data = dataSource; // przypisanie ( adresu )referencji (ponieważ jest to obiekt złożony) dataSource pod właściwość data
    },

    init: function(){ //method init
      const thisApp = this;
      //console.log('*** App starting ***');
     // console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData(); //ma zadanie przygotować nam łatwy dostęp do danych. Przypisuje więc do app.data (właściwości całego obiektu app) referencję do dataSource
      thisApp.initMenu (); //przejdzie po każdym produkcie z osobna i stworzy dla niego instancję Product, czego wynikiem będzie również utworzenie na stronie reprezentacji HTML każdego z produktów w thisApp.data.products.
    },
  };

  app.init();
}
