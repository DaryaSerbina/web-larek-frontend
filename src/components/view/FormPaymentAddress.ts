import { IValidationResult } from '../../types';
import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';

export class FormPaymentAddress extends Component<HTMLFormElement> {
  private paymentButtons: NodeListOf<HTMLButtonElement>;
  private addressInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private errors: HTMLElement;
  private emitter: EventEmitter;

  constructor(container: HTMLFormElement, emitter: EventEmitter) {
    super(container);
    this.paymentButtons = container.querySelectorAll('.button_alt');
    this.addressInput = ensureElement<HTMLInputElement>('.form__input[name="address"]', container);
    this.submitButton = ensureElement<HTMLButtonElement>('.form__button', container);
    this.errors = ensureElement<HTMLElement>('.form__errors', container);
    this.emitter = emitter;

    this.paymentButtons.forEach((btn) =>
      btn.addEventListener('click', () => {
        this.setPayment(btn.dataset.payment as 'card' | 'cash');
      })
    );

    this.addressInput.addEventListener('input', () => {
      this.emitter.emit('order:payment_address_validated', {
        payment: this.container.dataset.payment,
        address: this.addressInput.value,
      });
    });

    this.submitButton.addEventListener('click', () => {
      this.emitter.emit('order:payment_address_submit', {
        payment: this.container.dataset.payment,
        address: this.addressInput.value,
      });
    });
  }

  setPayment(payment: 'card' | 'cash'): void {
    this.container.dataset.payment = payment;
    this.paymentButtons.forEach((btn) => {
      this.toggleClass(btn, 'button_alt-active', btn.dataset.payment === payment);
    });
    this.emitter.emit('order:payment_address_validated', {
      payment,
      address: this.addressInput.value,
    });
  }

  setValid(isValid: boolean): void {
    this.setDisabled(this.submitButton, !isValid);
  }

  setErrors(errors: string[]): void {
    this.setText(this.errors, errors.join(', '));
  }
}