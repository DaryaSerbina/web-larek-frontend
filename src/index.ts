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
const appState = new AppState(emitter);
const basket = new Basket(emitter);
const order = new Order(emitter);
const page = new Page(document.body, emitter, basket);
const modal = new Modal(ensureElement<HTMLElement>('.modal'), emitter);

emitter.on('catalog:changed', (products: IProduct[]): void => {
  console.log('Catalog changed:', products); // Debug
  page.setCatalog(products);
});

emitter.on('card:select', (product: IProduct): void => {
  console.log('Card selected:', product); // Debug
  appState.setPreview(product);
});

emitter.on('preview:changed', (product: IProduct | null): void => {
  console.log('Preview changed:', product); // Debug
  if (product) {
    const cardElement = cloneTemplate<HTMLElement>('#card-preview');
    const card = new Card(cardElement, emitter, 'preview');
    card.setTitle(product.title);
    card.setImageSrc(product.image);
    card.setPrice(product.price);
    card.setDescription(product.description || '');
    card.setButtonText(
      basket.getBasket().items.some((item: IBasketProduct) => item.id === product.id) ? 'В корзине' : 'Купить'
    );
    modal.contentElement = cardElement;
    modal.open();
  }
});

emitter.on('basket:changed', (basketData: IBasket): void => {
  console.log('Basket changed:', basketData); // Debug
  page.setCounter(basketData.items.length);
  const basketElement = cloneTemplate<HTMLElement>('#basket');
  const basketView = new BasketView(basketElement, emitter);
  basketView.setItems(basketData.items);
  basketView.setTotal(basketData.total);
  modal.contentElement = basketElement;
  modal.open();
});

emitter.on('basket:add', (data: { id: string }): void => {
  console.log('Adding to basket:', data); // Debug
  const product = appState.getCatalog().find((p) => p.id === data.id);
  if (product) {
    basket.addToBasket(product);
    const cardElement = cloneTemplate<HTMLElement>('#card-preview');
    const card = new Card(cardElement, emitter, 'preview');
    card.setButtonText('В корзине');
    modal.contentElement = cardElement;
  }
});

emitter.on('basket:remove', (data: { id: string }): void => {
  console.log('Removing from basket:', data); // Debug
  basket.removeFromBasket(data.id);
});

emitter.on('basket:open_order', (): void => {
  console.log('Opening order form'); // Debug
  const formElement = cloneTemplate<HTMLFormElement>('#form-payment-address');
  const form = new FormPaymentAddress(formElement, emitter);
  modal.contentElement = formElement;
  modal.open();
});

emitter.on('order:payment_address_validated', (validation: IValidationResult): void => {
  console.log('Payment address validated:', validation); // Debug
  const formElement = ensureElement<HTMLFormElement>('.form');
  const form = new FormPaymentAddress(formElement, emitter);
  form.setValid(validation.isValid);
  form.setErrors(validation.errors);
});

emitter.on('order:payment_address_submit', (data: { payment: 'card' | 'cash'; address: string }): void => {
  console.log('Payment address submitted:', data); // Debug
  order.setPayment(data.payment);
  order.setAddress(data.address);
  const validation = order.validateOrder();
  if (validation.isValid) {
    const formElement = cloneTemplate<HTMLFormElement>('#form-email-phone');
    const form = new FormEmailPhone(formElement, emitter);
    modal.contentElement = formElement;
    modal.open();
  } else {
    emitter.emit('order:payment_address_validated', validation);
  }
});

emitter.on('order:email_phone_validated', (validation: IValidationResult): void => {
  console.log('Email phone validated:', validation); // Debug
  const formElement = ensureElement<HTMLFormElement>('.form');
  const form = new FormEmailPhone(formElement, emitter);
  form.setValid(validation.isValid);
  form.setErrors(validation.errors);
});

emitter.on('order:email_phone_submit', (data: { email: string; phone: string }): void => {
  console.log('Email phone submitted:', data); // Debug
  order.setEmail(data.email);
  order.setPhone(data.phone);
  order.setItems(basket.getBasket().items.map((item: IBasketProduct) => ({ id: item.id })));
  order.setTotal(basket.getTotal());
  order.submitOrder();
});

emitter.on('order:success', (result: IOrderResult): void => {
  console.log('Order success:', result); // Debug
  const successElement = cloneTemplate<HTMLElement>('#success');
  const success = new SuccessView(successElement, emitter);
  success.setTotal(result.total);
  modal.contentElement = successElement;
  modal.open();
  basket.getBasket().items = [];
  basket.getBasket().total = null;
});

emitter.on('success:close', (): void => {
  console.log('Success closed'); // Debug
  modal.close();
});

appState.setCatalog();