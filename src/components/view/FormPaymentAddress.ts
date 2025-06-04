import { IValidationResult } from '../../types';
import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';

interface IFormState {
    valid: boolean;
    errors: string[];
}

export class FormPaymentAddress<T> extends Component<IFormState> {
  protected paymentButtons: NodeListOf<HTMLButtonElement>;
  protected addressInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errors: HTMLElement;
  protected emitter: EventEmitter;

  constructor(container: HTMLFormElement, emitter: EventEmitter) {
    super(container);
    this.paymentButtons = container.querySelectorAll('.button_alt');
    this.addressInput = ensureElement<HTMLInputElement>('.form__input[name="address"]', container);
    this.submitButton = ensureElement<HTMLButtonElement>('.order__button', container);
    this.errors = ensureElement<HTMLElement>('.form__errors', container);
    this.emitter = emitter;

        this.paymentButtons.forEach((btn) => {
      btn.addEventListener('click', this.setPayment.bind(this, btn.name as 'card' | 'cash'));
    });

    this.addressInput.addEventListener('input', () => {
      this.emitter.emit('order:payment_address_validated', {
        payment: this.container.dataset.payment,
        address: this.addressInput.value,
      });
    });

    this.submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.emitter.emit('order:payment_address_submit', {
        payment: this.container.dataset.payment,
        address: this.addressInput.value,
      });
    });
  }


setPayment(payment: 'card' | 'cash'): void {

        this.container.dataset.payment = payment;
        this.paymentButtons.forEach((btn) => {           
            const isSelected = btn.name === payment;
            if (isSelected) {
                btn.classList.add('button_alt-active');
            } else {
                btn.classList.remove('button_alt-active');
            }
        });
}

  setValid(isValid: boolean): void {
    this.setDisabled(this.submitButton, isValid);
  }

  setErrors(errors: string[]): void {
    this.setText(this.errors, errors);
  }
}