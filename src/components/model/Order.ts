import {
	IOrderForm,
	IValidationResult,
	IBasketProduct,
	IOrderResult,
} from '../../types';
import { EventEmitter } from '../presenter/events';
import { Api } from '../presenter/api';
import { API_URL } from '../utils/constants';
import { FormPaymentAddress } from '../view/FormPaymentAddress';
import { Basket } from './Basket';

const emitter = new EventEmitter();
const basket = new Basket(emitter);

export class Order<T> extends FormPaymentAddress<IOrderForm> {
	protected order: IOrderForm = {
		payment: 'card',
		email: '',
		phone: '',
		address: '',
		total: null,
		items: [],
	};
	protected api: Api;
	protected emitter: EventEmitter;

	constructor(container: HTMLFormElement, emitter: EventEmitter) {
		super(container, emitter);
		this.api = new Api(API_URL);
		this.emitter = emitter;
	}

	setAddress(address: string): void {
		this.order.address = address;
		this.emitter.emit('order:payment_address_validated', this.validateOrder());
	}

	setEmail(email: string): void {
		this.order.email = email;
	}

	setPhone(phone: string): void {
		this.order.phone = phone;
	}

	setItems(items: Pick<IBasketProduct, 'id'>[]): void {
		this.order.items = items.map((item) => ({ id: item.id }));
	}

	setTotal(total: number | null): void {
		this.order.total = total;
	}

	validateFormPaymentAddres(): IValidationResult {
		const errors: string[] = [];
		if (!this.order.address.trim()) errors.push('Address is required');
		console.log(errors);
		return { isValid: errors.length === 0, errors };
	}

	validateFormEmailPhone(): IValidationResult {
		const errors: string[] = [];
		if (!this.order.email || !/\S+@\S+\.\S+/.test(this.order.email))
			errors.push('Invalid email');
		if (!this.order.phone.trim()) errors.push('Phone is required');
		return { isValid: errors.length === 0, errors };
	}

	validateOrder(): IValidationResult {
		const errors: string[] = [];
		if (!this.order.address.trim()) errors.push('Address is required');
		if (!this.order.email || !/\S+@\S+\.\S+/.test(this.order.email))
			errors.push('Invalid email');
		if (!this.order.phone.trim()) errors.push('Phone is required');
		return { isValid: errors.length === 0, errors };
	}

	async submitOrder(): Promise<void> {
		const validation = this.validateOrder();
		if (!validation.isValid) {
			return;
		}

		const basketItems = basket.getBasket().items;

		const paidItems = basketItems.filter((item) => item.price !== null);

		if (paidItems.length === 0) {
			this.emitter.emit('order:email_phone_validated', {
				isValid: false,
				errors: ['Нельзя оформить заказ только с бесценными товарами'],
			});
			return;
		}

		const requestData = {
			...this.order,
			items: paidItems.map((item) => item.id),
			total: paidItems.reduce((sum, item) => sum + (item.price || 0), 0),
		};

		try {
			console.log('Отправка заказа:', requestData);
			const response = (await this.api.post(
				'/order',
				requestData
			)) as IOrderResult;
			this.emitter.emit('order:success', response);
		} catch (error) {
			console.error('Ошибка оформления заказа:', error);
			this.emitter.emit('order:email_phone_validated', {
				isValid: false,
				errors: ['Ошибка при оформлении заказа'],
			});
		}
	}
}
