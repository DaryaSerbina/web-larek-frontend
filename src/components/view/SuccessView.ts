import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';
import { Modal } from './Modal';

interface IModalData {
	content: HTMLElement;
}
const emitter = new EventEmitter();
const modal = new Modal(ensureElement<HTMLElement>('.modal'), emitter);

export class SuccessView extends Component<IModalData> {
	private total: HTMLElement;
	private closeButton: HTMLButtonElement;
	private emitter: EventEmitter;

	constructor(container: HTMLElement, emitter: EventEmitter) {
		super(container);
		this.total = ensureElement<HTMLElement>(
			'.order-success__description',
			container
		);
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			container
		);
		this.emitter = emitter;

		this.closeButton.addEventListener('click', () => this.handleCloseClick());
	}

	setTotal(total: number | null): void {
		this.setText(this.total, total ? `${total} синапсов` : '0 синапсов');
	}

	handleCloseClick(): void {
		this.emitter.emit('success:close');
	}

	render(data: IModalData): HTMLElement {
		super.render(data);
		modal.content = this.container;
		console.log(modal.content);
		modal.open();
		return this.container;
	}
}
