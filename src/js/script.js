/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

  };
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };
  class Product{ // deklaracja klasy
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }

      renderInMenu(){
        const thisProduct = this; // metoda która bedzie renderować ( tworzyc thisProduct.data na stronie)

        /* generate HTML based on temaplte */
        const generatedHTML = templates.menuProduct(thisProduct.data);

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
        thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // used images
        thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      }
      initAccordion(){

        const thisProduct = this;

        /* START: add event listener to clickable trigger on event click */
        thisProduct.accordionTrigger.addEventListener('click', function(event) {

          /* prevent default action for event */
            event.preventDefault();

          /* find active product (product that has active class) */

          const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

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
          thisProduct.addToCart();
        });

      }
      processOrder(){

        const thisProduct = this;
        //console.log('this product: ', thisProduct);

        // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
        const formData = utils.serializeFormToObject(thisProduct.form);

        // set price to default price
        let price = thisProduct.data.price;
        //console.log('aktualizowana zea w produkcie', price);

        // START start

        // for every category (param)...
        for(let paramId in thisProduct.data.params) {

          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
          const param = thisProduct.data.params[paramId];
          //console.log('param :', param);

          // for every option in this category
          for(let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('option: ', option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
            //console.log('optionSelected ', optionSelected);
          if(optionSelected) {

            // check if the option is not default
            if(!option.default) {

              // add option price to price variable

              price = price + option.price;

            }
          }else if(option.default) {
              // reduce price variable
              price = price - option.price;

          }
          // END price

          // START images
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); // '.' because we are looking after class
          //console.log(optionImage);


            // check if the option exists
            if(optionImage){

              if(optionSelected){

              // if the option exists add class active
              optionImage.classList.add(classNames.menuProduct.imageVisible);

          } else{

            // remove class active
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
      thisProduct.priceSingle = price;
      // multiply price by amount
      price *= thisProduct.amountWidget.value;
      // updat cealculated price in the HTML

      thisProduct.priceElem.innerHTML = price;

      thisProduct.prepareCartProductParams();

      }
      initAmountWidget(){
        const thisProduct = this;

        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem); // pass references to element in constructor(element)

        thisProduct.amountWidgetElem.addEventListener('updated', function(){
          thisProduct.processOrder();

        });

      }
      addToCart(){
        const thisProduct = this;
        app.cart.add(thisProduct.prepareCartProduct());

      }
      prepareCartProduct(){
        const thisProduct = this;

        const productSummary = {
          id: thisProduct.id,
          name: thisProduct.data.name,
          amount: thisProduct.amountWidget.value,
          priceSingle: thisProduct.priceSingle,
          price: thisProduct.priceSingle * thisProduct.amountWidget.value,
          params: thisProduct.prepareCartProductParams(),
        };

        return productSummary;

      }

      prepareCartProductParams(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log('param :', param);

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }

        // for every option in this category
        for(let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
                params[paramId].options[optionId] = option.label;
            }
         }
       }
    return params;
    }
  }
  class AmountWidget{

      constructor(element){

        const thisWidget = this;

        thisWidget.getElements(element);
        thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
        thisWidget.initActions();

      }
      getElements(element){
        const thisWidget = this;

        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);

        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      }
      setValue(value){
        const thisWidget = this;

        const newValue = parseInt(value); // parseInt zadba o konwersję takiej przykładowej '10' ( string) do liczby 10 ( Int)

        /* TODO: Add validation */

        if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin - 1 &&
        newValue <= settings.amountWidget.defaultMax + 1) {

          thisWidget.value = newValue;
          thisWidget.announce();
        }

        thisWidget.input.value = thisWidget.value;

      }

      initActions(){

        const thisWidget = this;

        thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        });

        thisWidget.linkDecrease.addEventListener('click', function(event){
          event.preventDefault();
          thisWidget.setValue(thisWidget.value - 1);
        });

        thisWidget.linkIncrease.addEventListener('click', function(event){
          event.preventDefault();
          thisWidget.setValue(thisWidget.value + 1);
        });

      }
      announce(){

        const thisWidget = this;
        //console.log(thisWidget);

        const event = new CustomEvent('updated', {bubbles: true});
        thisWidget.element.dispatchEvent(event);

      }
  }
  class Cart{
    constructor(element){

      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

  }
  getElements(element){

    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = element.querySelector(select.cart.form);
    thisCart.dom.phone = element.querySelector(select.cart.phone);
    thisCart.dom.address = element.querySelector(select.cart.address);

  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click' ,function(event){
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle('active');
      thisCart.dom.productList.addEventListener('updated', function(){thisCart.update();});

      thisCart.dom.productList.addEventListener('remove', function (event) {thisCart.remove(event.detail.cartProduct);});


      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });


    });

  }
  remove(event){
    const thisCart = this;
    event.dom.wrapper.remove(event);
    const removeElement = thisCart.products.indexOf(event);
    thisCart.products.splice(removeElement, 1);
    thisCart.update();
  }
  add(menuProduct){
    const thisCart = this;

        /* generate HTML based on temaplte */
        const generatedHTML = templates.cartProduct(menuProduct);

        /* create element using utilies.createElementFromHTML*/
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        /* add element to menu */
        thisCart.dom.productList.appendChild(generatedDOM)

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (const product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;

      }

      if (thisCart.totalNumber !== 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;

      } else {
        thisCart.totalPrice = 0;
      }
      thisCart.amountWidget;
      thisCart.totalPrice;


      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

      thisCart.dom.totalPrice.forEach(function (element) {
      element.innerHTML = thisCart.totalPrice;
    });
  }
  sendOrder(){

    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {

      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [] ,

    }
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parseResponse){
        console.log('parasedResponse ', parseResponse);
      });
  }
  }
  class CartProduct{
    constructor(menuProduct, element){

      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.priceSingle * menuProduct.amount;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.amountWidget();
      thisCartProduct.initActions();

    }

    getElements(element){

      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);

      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);

      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);

      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    amountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.recalculate();
      });

    }
    recalculate() {
      const thisCartProduct = this;

      thisCartProduct.amount = thisCartProduct.amountWidget.value;

      thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

    }
    remove (){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);

    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event) {

        event.preventDefault();

      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

      getData(){

        const thisCartProduct = this;

        const cartProductSummary = {
          id: thisCartProduct.id,
          name: thisCartProduct.name,
          amount: thisCartProduct.amount,
          priceSingle: thisCartProduct.priceSingle,
          price: thisCartProduct.price,
          params: thisCartProduct.params,
        };
        return cartProductSummary;

      }
  }
  const app = {

    initMenu: function(){ //method initMenu

      const thisApp = this;
      //console.log('thisApp.data :', thisApp.data);

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
      //console.log('thisApp ', thisApp.cart);

    },

  };

  app.init();
}

