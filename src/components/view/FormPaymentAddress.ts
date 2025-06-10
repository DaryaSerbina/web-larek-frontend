import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';

export class FormPaymentAddress extends Component<HTMLElement> {
	private paymentButtons: NodeListOf<HTMLButtonElement>;
	private addressInput: HTMLInputElement;
	private submitButton: HTMLButtonElement;
	private errors: HTMLElement;
	private emitter: EventEmitter;

	constructor(container: HTMLFormElement, emitter: EventEmitter) {
		super(container);
		this.paymentButtons = container.querySelectorAll('.button_alt');
		this.addressInput = ensureElement<HTMLInputElement>(
			'.form__input[name="address"]',
			container
		);
		this.submitButton = ensureElement<HTMLButtonElement>(
			'.order__button',
			container
		);
		this.errors = ensureElement<HTMLElement>('.form__errors', container);
		this.emitter = emitter;

		this.submitButton.disabled = true;

		this.paymentButtons.forEach((btn) => {
			btn.addEventListener('click', () => {
				this.setPayment(btn.name as 'card' | 'cash');
				this.checkValidity();
			});
		});

		this.addressInput.addEventListener('input', () => {
			this.checkValidity();
		});

		this.submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			if (this.container.dataset.payment && this.addressInput.value) {
				this.emitter.emit('order:payment_address_submit', {
					payment: this.container.dataset.payment as 'card' | 'cash',
					address: this.addressInput.value,
				});
			}
		});
	}

	private checkValidity(): void {
		const isValid =
			!!this.container.dataset.payment && !!this.addressInput.value;
		this.submitButton.disabled = !isValid;
	}

	setPayment(payment: 'card' | 'cash'): void {
		this.container.dataset.payment = payment;
		this.paymentButtons.forEach((btn) => {
			btn.classList.toggle('button_alt-active', btn.name === payment);
		});
	}

	setValid(isValid: boolean): void {
		this.submitButton.disabled = !isValid;
	}

	setErrors(errors: string[] | undefined): void {
		this.errors.textContent = errors?.join(', ') || '';
	}
}
