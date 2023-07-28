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

  /*const classNames = {
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
  class Product{ // deklaracja klasy
    constructor(id, data){
      const thisProduct = this; //  this jest odnośnikiem do obiektu, który jest utworzony przez klasę podczas inicjacji, a więc w momencie uruchomienia instrukcji new Product.  Zapisując właściwości do thisProduct, przypiszemy je więc po prostu do danej instancji.

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); // Zadba o to, by nasz konstruktor uruchomił tę funkcję od razu po utworzeniu instancji.
      //console.log('new Product: ', thisProduct);
      thisProduct.getElements(); // wywołania metod
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();


    }

      renderInMenu(){
        const thisProduct = this; // metoda która bedzie renderować ( tworzyc produkty na stronie)

        /* generate HTML based on temaplte */
        const generatedHTML = templates.menuProduct(thisProduct.data);
        //console.log('generatedHTML : ', generatedHTML);

        /* create element using utilies.createElementFromHTML*/
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        /* find menu container */
        const menuConatiner = document.querySelector(select.containerOf.menu);


        /* add element to menu */
        menuConatiner.appendChild(thisProduct.element);

      }
      getElements(){
        const thisProduct = this;

        thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // used in initAccordion
        thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
        thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
        thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
        thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);


      }

      initAccordion(){

        const thisProduct = this;
        //console.log('thisProduct ' , thisProduct );



        /* START: add event listener to clickable trigger on event click */
        thisProduct.accordionTrigger.addEventListener('click', function(event) {

          /* prevent default action for event */
            event.preventDefault();

          /* find active product (product that has active class) */

          const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
          //console.log('activeProducts' , activeProducts);

          /* if there is active product and it's not thisProduct.element,
          remove class active from it */


          for(let activeProduct of activeProducts){

            if (activeProduct !== thisProduct.element) {
                activeProduct.classList.remove('active');

            }
          }

          /* toggle active class on thisProduct.element */
          thisProduct.element.classList.toggle('active')

            });
          }
      initOrderForm(){

        const thisProduct = this;
        console.log('metoda initOrderForm: ', thisProduct);


        thisProduct.form.addEventListener('submit', function(event){
          event.preventDefault();
          thisProduct.processOrder();
        });

        for(let input of thisProduct.formInputs){
          input.addEventListener('change', function(){
            thisProduct.processOrder();
          });
        }

        thisProduct.cartButton.addEventListener('click', function(event){
          event.preventDefault();
          thisProduct.processOrder();
        });

      }
      processOrder() {

        const thisProduct = this;

        // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.form);

        // set price to default price
        let price = thisProduct.data.price;

        // for every category (param)...
        for(let paramId in thisProduct.data.params) {
          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
          const param = thisProduct.data.params[paramId];

          // for every option in this category
          for(let optionId in param.options) {
            // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
            const option = param.options[optionId];

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if(option.default == true) {

              // add option price to price variable

              price = price + option.price;

            }
          } else {
            // check if the option is default
            if(option.default !==  true) {
              // reduce price variable
              price = price - option.price;
            }
          }

          }
        }

        // update calculated price in the HTML
        thisProduct.priceElem.innerHTML = price;
      }
    }

  const app = {

    initMenu: function(){ //method initMenu

      const thisApp = this;
      console.log('thisApp.data :', thisApp.data);

      for(let productData in thisApp.data.products){

        new Product(productData, thisApp.data.products[productData]);
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