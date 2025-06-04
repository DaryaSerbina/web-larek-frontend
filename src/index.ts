import { EventEmitter } from './components/presenter/events';
import { AppState } from './components/model/AppData';
import { Basket } from './components/model/Basket';
import { Order } from './components/model/Order';
import { Page } from './components/view/Page';
import { Card } from './components/view/Card';
import { Modal } from './components/view/Modal';
import { Basket as BasketView } from './components/view/BasketView';
import { FormPaymentAddress } from './components/view/FormPaymentAddress';
import { FormEmailPhone } from './components/view/FormEmailPhone';
import { SuccessView } from './components/view/SuccessView';
import { ensureElement, cloneTemplate } from './components/utils/utils';
import { IProduct, IOrderResult, IBasketProduct, IBasket, IValidationResult } from './types';
import './scss/styles.scss';

const emitter = new EventEmitter();
const basket = new Basket(emitter);
const appState = new AppState(emitter);
//const order = new Order(emitter);
const page = new Page(document.body, emitter, basket);
const modal = new Modal(ensureElement<HTMLElement>('.modal'), emitter);
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const order = new Order(cloneTemplate(orderTemplate), emitter);
const orderPaymentAdress = ensureElement<HTMLElement>(orderTemplate);
const orderPaymentAdress1 = new FormEmailPhone(cloneTemplate(orderTemplate), emitter);

emitter.on('catalog:changed', (products: IProduct[]): void => {
  console.log('Catalog changed:', products);
  if (products.length === 0) {
    console.warn('No products to display');
    page.setCatalog([{
      id: 'placeholder',
      title: 'Нет товаров',
      image: 'https://placehold.co/100x100',
      price: null,
      description: '',
      category: ''
    }]);
  } else {
    page.setCatalog(products);
  }
});

emitter.on('card:select', (product: IProduct): void => {
  console.log('Card selected:', product);
  appState.setPreview(product);
});

emitter.on('preview:changed', (product: IProduct | null): void => {
  console.log('Preview changed:', product);
  if (product) {
   {
    console.log('Opening modal for product:', product.id);
    const cardElement = cloneTemplate<HTMLElement>('#card-preview');
    cardElement.dataset.id = product.id;
    const card = new Card(cardElement, emitter, 'preview');
    card.setTitle(product.title);
    card.setCategory(product.category);
    card.setImageSrc(product.image);
    card.setPrice(product.price);
    card.setDescription(product.description || '');
    card.setButtonText(basket.getBasket().items.some(item => item.id === product.id) ? 'В корзине' : 'Купить');
    modal.content = cardElement;
    modal.open();
  }
}});

emitter.on('basket:open', (): void => {
  console.log('Opening basket');
  const basketElement = cloneTemplate<HTMLElement>('#basket');
  const basketView = new BasketView(basketElement, emitter);
  basketView.setItems(basket.getBasket().items);
  basketView.setTotal(basket.getBasket().total);
  modal.content = basketElement;
  modal.open();
});

emitter.on('basket:changed', (basketData: IBasket): void => {
  console.log('Basket changed:', basketData);
  if (basketData === undefined) {
    page.setCounter(0);
    const basketElement = cloneTemplate<HTMLElement>('#basket');
    const basketView = new BasketView(basketElement, emitter);
    basketView.setItems([]); 
    basketView.setTotal(0); 
    modal.content = basketElement;
    modal.open(); 
    return;
  }

  page.setCounter(basketData.items.length);
  const basketElement = cloneTemplate<HTMLElement>('#basket');
  const basketView = new BasketView(basketElement, emitter);
  basketView.setItems(basketData.items);
  basketView.setTotal(basketData.total);
  modal.content = basketElement;
  modal.open();
});

emitter.on('basket:add', (data: { id: string }): void => {
  console.log('Adding to basket:', data);
  if (!data.id) {
    console.warn('No product ID provided for basket:add');
    return;
  }
  const product = appState.getCatalog().find((p) => p.id === data.id);
  if (product) {
    basket.addToBasket(product);
    modal.close(); // Закрываем модал после добавления
  } else {
    console.warn('Product not found:', data.id);
  }
});

emitter.on('basket:remove', (data: { id: string }): void => {
  console.log('Removing from basket:', data);
  basket.removeFromBasket(data.id);
});

emitter.on('_order', (): void => {
  console.log('Opening order form');
  orderPaymentAdress1.render({content: orderPaymentAdress});
});

emitter.on('order:payment_address_validated', (validation: IValidationResult): void => {
  console.log('Payment address validated:', validation);
  // const formElement = ensureElement<HTMLFormElement>('#order');
  // const form = new FormPaymentAddress(formElement, emitter);
  order.setValid(validation.isValid);
  order.setErrors(validation.errors);
});

emitter.on('order:payment_address_submit', (data: { payment: 'card' | 'cash'; address: string }): void => {
  console.log('Payment address submitted:', data);
  order.setPayment(data.payment);
  order.setAddress(data.address);
  const validation = order.validateFormPaymentAddres();
  console.log(validation.isValid)
  if (validation.isValid) {
    const formElement = cloneTemplate<HTMLFormElement>('#contacts');
    const form = new FormEmailPhone(formElement, emitter);
    console.log(validation)
    emitter.emit('order:payment_address_validated', validation);
    modal.open();
  } else {
    emitter.emit('order:payment_address_validated', validation);
  }
});

emitter.on('order:email_phone_validated', (validation: IValidationResult): void => {
  console.log('Email phone validated:', validation);
  const formElement = ensureElement<HTMLFormElement>('.form');
  const form = new FormEmailPhone(formElement, emitter);
  form.setValid(validation.isValid);
  form.setErrors(validation.errors);
});

emitter.on('order:email_phone_submit', (data: { email: string; phone: string }): void => {
  console.log('Email phone submitted:', data);
  order.setEmail(data.email);
  order.setPhone(data.phone);
  order.setItems(basket.getBasket().items.map((item: IBasketProduct) => ({ id: item.id })));
  order.setTotal(basket.getTotal());
  order.submitOrder();
});

emitter.on('order:success', (result: IOrderResult): void => {
  console.log('Order success:', result);
  const successElement = cloneTemplate<HTMLElement>('#success');
  const success = new SuccessView(successElement, emitter);
  success.setTotal(result.total);
  
  modal.open();
  basket.getBasket().items = [];
  basket.getBasket().total = null;
});

emitter.on('success:close', (): void => {
  console.log('Success closed');
  modal.close();
});

emitter.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
emitter.on('modal:close', () => {
    page.locked = false;
});


// Загружаем каталог без автоматического открытия модала
appState.setCatalog();

