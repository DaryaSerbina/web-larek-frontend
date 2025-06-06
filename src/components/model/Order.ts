import {
	IOrderForm,
	IValidationResult,
	IBasketProduct,
	IOrderResult,
} from '../../types';
import { EventEmitter } from '../presenter/events';
import { Api } from '../presenter/api';
import { API_URL } from '../utils/constants';
import { Component } from '../presenter/Component';

export class Order<T> extends Component<IOrderForm> {
	order: IOrderForm = {
		payment: 'card',
		email: '',
		phone: '',
		address: '',
		total: null,
		items: [],
	};

	protected _api: Api;
	protected _emitter: EventEmitter;

	constructor(container: HTMLFormElement, emitter: EventEmitter) {
		super(container);
		this._api = new Api(API_URL);
		this._emitter = emitter;
	}

	setAddress(address: string): void {
		this.order.address = address;
		this._emitter.emit('order:payment_address_validated', this.validateOrder());
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

	async submitOrder(requestData: IOrderForm): Promise<void> {
		const validation = this.validateOrder();
		if (!validation.isValid) {
			return;
		}

		try {
			const apiPayload = {
				payment: this.order.payment,
				email: requestData.email,
				phone: requestData.phone,
				address: this.order.address,
				total: requestData.total,
				items: requestData.items.map((item) => item.id),
			};

			const response = (await this._api.post(
				'/order',
				apiPayload
			)) as IOrderResult;
			this._emitter.emit('order:success', response);
		} catch (error) {
			console.error('Ошибка оформления заказа:', error);
			this._emitter.emit('order:email_phone_validated', {
				isValid: false,
				errors: ['Ошибка при оформлении заказа'],
			});
		}
	}
}
