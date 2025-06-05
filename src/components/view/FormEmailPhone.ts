import { IValidationResult } from '../../types';
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
	protected emailInput: HTMLInputElement;
	protected phoneInput: HTMLInputElement;
	protected submitButton: HTMLButtonElement;
	protected errors: HTMLElement;
	protected emitter: EventEmitter;

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

		this.emailInput.addEventListener('input', this.validateFields.bind(this));
		this.phoneInput.addEventListener('input', this.validateFields.bind(this));

		this.submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.emitter.emit('order:email_phone_submit', {
				email: this.emailInput.value,
				phone: this.phoneInput.value,
			});
		});
	}

	validateFields() {
		const validation = {
			email: this.emailInput.value,
			phone: this.phoneInput.value,
		};
		this.emitter.emit('order:email_phone_validated', validation);
	}

	setValid(isValid: boolean): void {
		this.setDisabled(this.submitButton, isValid);
	}

	setErrors(errors: string[]): void {
		this.setText(this.errors, errors);
	}

	render(data: IModalData): HTMLElement {
		super.render(data);
		modal.content = this.container;

		console.log(modal.content);
		modal.open();

		return this.container;
	}
}
