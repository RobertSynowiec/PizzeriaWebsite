import { settings, select, templates } from "../settings.js";
import CartProduct from './CartProduct.js';
import utils from "../utils.js";

class Cart {
  constructor(element) {

    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();

  }
  getElements(element) {

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
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle('active');
      thisCart.dom.productList.addEventListener('updated', function () { thisCart.update(); });

      thisCart.dom.productList.addEventListener('remove', function (event) { thisCart.remove(event.detail.cartProduct); });


      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });


    });

  }
  remove(event) {
    const thisCart = this;
    event.dom.wrapper.remove(event);
    const removeElement = thisCart.products.indexOf(event);
    thisCart.products.splice(removeElement, 1);
    thisCart.update();
  }
  add(menuProduct) {
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
  sendOrder() {

    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    console.log('cart url', url);

    const payload = {

      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],

    }
    for (let prod of thisCart.products) {
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
      .then(function (response) {
        return response.json();
      })
      .then(function (parseResponse) {
        console.log('parasedResponse ', parseResponse);
      });
  }
}
export default Cart;