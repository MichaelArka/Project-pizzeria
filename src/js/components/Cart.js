import {select, classNames, templates, settings} from '/js/settings.js';
import CartProduct from './CartProduct.js';
import utils from '/js/utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    this.initActions();
    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;

    /* [DONE] generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log(generatedHTML);

    /* [DONE] create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* [DONE] find menu container */
    thisCart.dom.productList.appendChild(generatedDOM);
    //console.log(thisCart.dom.productList);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);

    thisCart.update();
  }

  update(){
    const thisCart = this;

    let deliveryFee = settings.cart.defaultDeliveryFee;
    if(thisCart.products.length === 0){
      deliveryFee = 0;
    }

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (const product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    thisCart.totalNumber == 0 ? thisCart.deliveryFee = 0 : thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    for (const domTotalPrice of thisCart.dom.totalPrice){
      domTotalPrice.innerHTML = thisCart.totalPrice;
    }
  }

  remove(removeProduct){
    const thisCart = this;

    const indexOfProduct = thisCart.products.indexOf(CartProduct);
    thisCart.products.splice(indexOfProduct, 1);

    removeProduct.dom.wrapper.remove();
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    console.log(url);

    let payload = {};

    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.dom.TotalPrice;
    payload.subtotalPrice = thisCart.dom.subtotalPrice;
    payload.totalNumber = thisCart.dom.totalNumber;
    payload.deliveryFee = thisCart.dom.deliveryFee;
    payload.products = [];

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json(); 
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      })
      .then(function(){
        thisCart.clearCart();
      });

  }

  clearCart(){
    const thisCart = this;

    for(let prod of thisCart.products){
      prod.dom.wrapper.remove();
    }

    thisCart.products = [];
    thisCart.update();
  }
}

export default Cart;