import {templates, select, classNames} from '/js/settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '/js/utils.js';

class Product {
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

    //console.log('newProduct', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* [DONE] generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(generatedHTML);

    /* [DONE] create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* [DONE] find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* [DONE] add element to menu */
    menuContainer.appendChild(thisProduct.element);

  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* [DONE] find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log('clickableTrigger:', clickableTrigger);

    /* [DONE] START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event){

      /* [DONE] prevent default action for event */
      event.preventDefault();

      /* [DONE] find active product (product that has active class */
      const activeProduct = document.querySelectorAll(select.all.menuProductsActive);
      //console.log(activeProduct);
        
      /* [DONE] if there is active product and it's not thisProduct.element, remove class active from it */
      for(let active of activeProduct){
        if(active !== thisProduct.element){
          active.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }
    
      /* [DONE] toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm', this.initOrderForm);

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

    // [DONE] covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    // [DONE] set price to default price
    // let price = thisProduct.data.price;
    thisProduct.priceSingle = thisProduct.data.price;

    // [DONE] for every category (param)...
    for(let paramId in thisProduct.data.params){

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // [DONE] for every option in this category
      for(let optionId in param.options){

        // [DONE] determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);

        // [DONE] check if there is param with a name of paramId in formData and if it includes optionId
        const productSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(productSelected) {

          // [DONE] check if the option is not default
          if(!option.default){

            // [DONE] add option price to price variable
            thisProduct.priceSingle += option.price;
          }

        } else {

          // [DONE] check if the option is default
          if(option.default == true){

            // [DONE] reduce price variable
            thisProduct.priceSingle -= option.price;
          }
        }
        const productImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        //console.log('productImage', productImage);

        if(productImage){
          if(productSelected){
            productImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            productImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    /* Multiply price by amount */
    //price *= thisProduct.amountWidget.value;
    const price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* [DONE] update calculated price in the HTML */
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.amount * productSummary.priceSingle;
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    const params = {};

    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {}
      };

      for(let optionId in param.options){
        const option = param.options[optionId];
        //console.log(optionId, option);

        //const productSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (formData[paramId].includes(optionId)) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}

export default Product;