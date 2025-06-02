import { IOrderForm, IValidationResult, IBasketProduct, IOrderResult } from '../../types';
import { EventEmitter } from '../presenter/events';
import { Api } from '../presenter/api';
import { API_URL } from '../utils/constants';

export class Order {
  private order: IOrderForm = {
    payment: 'card',
    email: '',
    phone: '',
    address: '',
    total: null,
    items: [],
  };
  private api: Api;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.api = new Api(API_URL);
    this.emitter = emitter;
  }

  setPayment(payment: 'card' | 'cash'): void {
    this.order.payment = payment;
    this.emitter.emit('order:payment_address_validated', this.validateOrder());
  }

  setAddress(address: string): void {
    this.order.address = address;
    this.emitter.emit('order:payment_address_validated', this.validateOrder());
  }

  setEmail(email: string): void {
    this.order.email = email;
    this.emitter.emit('order:email_phone_validated', this.validateOrder());
  }

  setPhone(phone: string): void {
    this.order.phone = phone;
    this.emitter.emit('order:email_phone_validated', this.validateOrder());
  }

  setItems(items: Pick<IBasketProduct, 'id'>[]): void {
    this.order.items = items;
  }

  setTotal(total: number | null): void {
    this.order.total = total;
  }

  validateOrder(): IValidationResult {
    const errors: string[] = [];
    if (!this.order.address.trim()) errors.push('Address is required');
    if (!this.order.email || !/\S+@\S+\.\S+/.test(this.order.email)) errors.push('Invalid email');
    if (!this.order.phone.trim()) errors.push('Phone is required');
    return { isValid: errors.length === 0, errors };
  }

  async submitOrder(): Promise<void> {
    const validation = this.validateOrder();
    if (!validation.isValid) {
      this.emitter.emit('order:email_phone_validated', validation);
      return;
    }
    try {
      const response = (await this.api.post('/order', this.order)) as IOrderResult;
      this.emitter.emit('order:success', response);
    } catch (error) {
      console.error('Failed to submit order:', error);
      this.emitter.emit('order:email_phone_validated', { isValid: false, errors: ['Failed to submit order'] });
    }
  }
}