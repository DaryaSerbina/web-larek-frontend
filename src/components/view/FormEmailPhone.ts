import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';
import { Modal } from './Modal';

interface IModalData {
	content: HTMLElement;
}
const emitter = new EventEmitter();
const modal = new Modal(ensureElement<HTMLElement>('.modal'), emitter);

export class FormEmailPhone extends Component<IModalData> {
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private submitButton: HTMLButtonElement;
	private errors: HTMLElement;
	private emitter: EventEmitter;

	constructor(container: HTMLFormElement, emitter: EventEmitter) {
		super(container);
		this.emailInput = ensureElement<HTMLInputElement>(
			'.form__input[name="email"]',
			container
		);
		this.phoneInput = ensureElement<HTMLInputElement>(
			'.form__input[name="phone"]',
			container
		);
		this.submitButton = ensureElement<HTMLButtonElement>('.button', container);
		this.errors = ensureElement<HTMLElement>('.form__errors', container);
		this.emitter = emitter;

		this.emailInput.addEventListener('input', this.checkValidity.bind(this));
		this.phoneInput.addEventListener('input', this.checkValidity.bind(this));

		this.submitButton.disabled = true;

		this.submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.emitter.emit('order:email_phone_submit', {
				email: this.emailInput.value,
				phone: this.phoneInput.value,
			});
		});
	}

	private isFormValid(): boolean {
		return !!this.emailInput.value && !!this.phoneInput.value;
	}

	checkValidity(): void {
		const isValid = this.isFormValid();
		this.submitButton.disabled = !isValid;
		this.emitter.emit('order:email_phone_validated', {
			email: this.emailInput.value,
			phone: this.phoneInput.value,
			isValid,
		});
	}

	setValid(isValid: boolean): void {
		this.submitButton.disabled = !isValid;
	}

	setErrors(errors: string[] | undefined): void {
		if (errors !== undefined) {
			this.setText(this.errors, errors);
		}
	}

	render(data: IModalData): HTMLElement {
		super.render(data);
		modal.content = this.container;
		modal.open();
		return this.container;
	}
}
