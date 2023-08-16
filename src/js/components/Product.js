import { select, templates, classNames, } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from './AmountWidget.js';

class Product { // deklaracja klasy
  constructor(id, data) {
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

  renderInMenu() {
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
  getElements() {

    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // used in initAccordion
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // used images
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {

    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */

      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element,
      remove class active from it */

      for (let activeProduct of activeProducts) {

        if (activeProduct !== thisProduct.element) {
          activeProduct.classList.remove('active');

        }
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active')

    });
  }
  initOrderForm() {

    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }
  processOrder() {

    const thisProduct = this;
    //console.log('this product: ', thisProduct);

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);

    // set price to default price
    let price = thisProduct.data.price;
    //console.log('aktualizowana zea w produkcie', price);

    // START start

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log('param :', param);

      // for every option in this category
      for (let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log('option: ', option);

        // check if there is param with a name of paramId in formData and if it includes optionId
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        //console.log('optionSelected ', optionSelected);
        if (optionSelected) {

          // check if the option is not default
          if (!option.default) {

            // add option price to price variable

            price = price + option.price;

          }
        } else if (option.default) {
          // reduce price variable
          price = price - option.price;

        }
        // END price

        // START images
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); // '.' because we are looking after class
        //console.log(optionImage);


        // check if the option exists
        if (optionImage) {

          if (optionSelected) {

            // if the option exists add class active
            optionImage.classList.add(classNames.menuProduct.imageVisible);

          } else {

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
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem); // pass references to element in constructor(element)

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();

    });

  }
  addToCart() {
    const thisProduct = this;
    // app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {

      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);

  }
  prepareCartProduct() {
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

  prepareCartProductParams() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log('param :', param);

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      }

      // for every option in this category
      for (let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // check if there is param with a name of paramId in formData and if it includes optionId
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}

export default Product;