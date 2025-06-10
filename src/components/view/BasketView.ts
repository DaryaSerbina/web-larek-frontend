import { IBasketProduct } from '../../types';
import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';

export class Basket extends Component<IBasketProduct> {
	protected _itemsContainer: HTMLElement;
	protected _total: HTMLElement;
	protected _orderButton: HTMLButtonElement;
	protected _emitter: EventEmitter;
	protected _items: IBasketProduct[] = [];

	constructor(container: HTMLElement, emitter: EventEmitter) {
		super(container);
		this._itemsContainer = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this._total = ensureElement<HTMLElement>('.basket__price', container);
		this._orderButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);
		this._emitter = emitter;

		this._orderButton.addEventListener('click', () => {
			this._emitter.emit('_order');
		});

		this._orderButton.disabled = true;
	}

	setItems(items: HTMLElement[]): void {
		this._itemsContainer.replaceChildren(...items);
		this._orderButton.disabled = items.length === 0;
	}

	setTotal(total: number | null): void {
		this.setText(this._total, total ? `${total} синапсов` : '0 синапсов');
	}
}
