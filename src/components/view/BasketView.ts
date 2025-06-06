import { IBasketProduct } from '../../types';
import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { Card } from './Card';

export class Basket extends Component<HTMLElement> {
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

	setItems(items: IBasketProduct[]): void {
		this._items = items;
		this._itemsContainer.innerHTML = '';
		this._orderButton.disabled = items.length === 0;
		if (items.length) {
			const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
			this.setTotal(totalPrice);
			items.forEach((item, index) => {
				const itemElement = cloneTemplate<HTMLElement>('#card-basket');
				const card = new Card(itemElement, this._emitter, 'basket');
				card.setTitle(item.title);
				card.setPrice(item.price);
				itemElement.querySelector('.basket__item-index')!.textContent = (
					index + 1
				).toString();
				itemElement
					.querySelector('.basket__item-delete')!
					.addEventListener('click', () => {
						const updatedItems = items.filter((i) => i.id !== item.id);
						this.setItems(updatedItems);
						this._emitter.emit('basket:remove', { id: item.id });
					});

				this._itemsContainer.append(itemElement);
			});
		} else {
			this.setTotal(0);
		}
	}

	setTotal(total: number | null): void {
		this.setText(this._total, total ? `${total} синапсов` : '0 синапсов');
	}
}
