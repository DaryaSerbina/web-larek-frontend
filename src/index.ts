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
import {
	IProduct,
	IOrderResult,
	IBasketProduct,
	IBasket,
	IValidationResult,
	IOrderForm,
} from './types';
import './scss/styles.scss';

const emitter = new EventEmitter();
const basket = new Basket(emitter);
const appState = new AppState(emitter);

const page = new Page(document.body, emitter, basket);
const modal = new Modal(ensureElement<HTMLElement>('.modal'), emitter);
const orderPaymentAdressTemplate = ensureElement<HTMLTemplateElement>('#order');
const orderPaymentAdress = new FormPaymentAddress(
	cloneTemplate(orderPaymentAdressTemplate),
	emitter
);
const orderEmailPhoneTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderEmailPhone = new FormEmailPhone(
	cloneTemplate(orderEmailPhoneTemplate),
	emitter
);
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const order = new Order(cloneTemplate(orderTemplate), emitter);
const orderSuccessTemplate = ensureElement<HTMLTemplateElement>('#success');
const orderSuccess = new SuccessView(
	cloneTemplate(orderSuccessTemplate),
	emitter
);

emitter.on('catalog:changed', (products: IProduct[]): void => {
	if (products.length === 0) {
		console.warn('No products to display');
		page.setCatalog([
			{
				id: 'placeholder',
				title: 'Нет товаров',
				image: 'https://placehold.co/100x100',
				price: null,
				description: '',
				category: '',
			},
		]);
	} else {
		page.setCatalog(products);
	}
});

emitter.on('card:select', (product: IProduct): void => {
	appState.setPreview(product);
});

emitter.on('preview:changed', (product: IProduct | null): void => {
	if (product) {
		{
			const cardElement = cloneTemplate<HTMLElement>('#card-preview');
			cardElement.dataset.id = product.id;
			const card = new Card(cardElement, emitter, 'preview');
			card.setTitle(product.title);
			card.setCategory(product.category);
			card.setImageSrc(product.image);
			card.setPrice(product.price);
			card.setDescription(product.description || '');
			card.setButtonText(
				basket.getBasket().items.some((item) => item.id === product.id)
					? 'В корзине'
					: 'Купить'
			);
			modal.content = cardElement;
			modal.open();
		}
	}
});

emitter.on('basket:open', (): void => {
	const basketElement = cloneTemplate<HTMLElement>('#basket');
	const basketView = new BasketView(basketElement, emitter);
	basketView.setItems(basket.getBasket().items);
	basketView.setTotal(basket.getBasket().total);
	modal.content = basketElement;
	modal.open();
});

emitter.on('basket:changed', (basketData: IBasket): void => {
	if (basketData === undefined) {
		page.setCounter(0);
		const basketElement = cloneTemplate<HTMLElement>('#basket');
		const basketView = new BasketView(basketElement, emitter);
		basketView.setItems([]);
		basketView.setTotal(0);
		return;
	}

	page.setCounter(basketData.items.length);
	const basketElement = cloneTemplate<HTMLElement>('#basket');
	const basketView = new BasketView(basketElement, emitter);
	basketView.setItems(basketData.items);
	basketView.setTotal(basketData.total);
});

emitter.on('basket:add', (data: { id: string }): void => {
	if (!data.id) {
		console.warn('No product ID provided for basket:add');
		return;
	}
	const product = appState.getCatalog().find((p) => p.id === data.id);
	if (product) {
		basket.addToBasket(product);
		modal.close();
	} else {
		console.warn('Product not found:', data.id);
	}
});

emitter.on('basket:remove', (data: { id: string }): void => {
	basket.removeFromBasket(data.id);
});

emitter.on('_order', (): void => {
	orderPaymentAdress.render({ content: orderPaymentAdressTemplate });
});

emitter.on(
	'order:payment_address_validated',
	(validation: IValidationResult): void => {
		orderPaymentAdress.setValid(validation.isValid);
		orderPaymentAdress.setErrors(validation.errors);
	}
);

emitter.on(
	'order:payment_address_submit',
	(data: { payment: 'card' | 'cash'; address: string }): void => {
		orderPaymentAdress.setPayment(data.payment);
		order.setAddress(data.address);
		const validation = order.validateFormPaymentAddres();
		if (validation.isValid) {
			emitter.emit('order:payment_address_validated', validation);
			orderEmailPhone.render({ content: orderEmailPhoneTemplate });
		} else {
			emitter.emit('order:payment_address_validated', validation);
		}
	}
);

emitter.on(
	'order:email_phone_validated',
	(validation: IValidationResult): void => {
		orderEmailPhone.setValid(validation.isValid);
		orderEmailPhone.setErrors(validation.errors);
	}
);

emitter.on(
	'order:email_phone_submit',
	async (data: { email: string; phone: string }): Promise<void> => {
		const basketItems = basket.getBasket().items;
		const paidItems = basketItems.filter(
			(item) => item.price !== null && item.price !== undefined
		);
		order.setEmail(data.email);
		order.setPhone(data.phone);
		order.setItems(paidItems.map((item) => ({ id: item.id.toString() })));

		const total = paidItems.reduce((sum, item) => sum + (item.price || 0), 0);
		order.setTotal(total);

		try {
			const orderFormData: IOrderForm = {
				payment: 'card',
				email: data.email,
				phone: data.phone,
				address: '',
				total: total,
				items: paidItems.map((item) => ({ id: item.id.toString() })),
			};

			await order.submitOrder(orderFormData);
		} catch (error) {
			console.error('Failed to submit order:', error);
		}
	}
);

emitter.on('order:success', (result: IOrderResult): void => {
	const successElement = cloneTemplate<HTMLElement>('#success');
	const success = new SuccessView(successElement, emitter);
	const orderTotal = result.total;
	basket.clearBasket();
	success.setTotal(orderTotal);
	orderSuccess.render({ content: orderSuccessTemplate });
	modal.content = successElement;
	modal.open();
});

emitter.on('success:close', (): void => {
	modal.close();
});

emitter.on('modal:open', () => {
	page.locked = true;
});

emitter.on('modal:close', () => {
	page.locked = false;
});
appState.setCatalog();
