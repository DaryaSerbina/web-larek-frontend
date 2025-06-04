import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { Card } from './Card';
import { IProduct } from '../../types';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { Basket } from '../model/Basket';

export class Page extends Component<HTMLElement> {
	protected counter: HTMLElement;
	private catalog: HTMLElement;
	protected emitter: EventEmitter;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, emitter: EventEmitter, basket: Basket) {
		super(container);
		this.counter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			container
		);
		this.catalog = ensureElement<HTMLElement>('.gallery', container);
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLElement>('.header__basket');

		this._basket.addEventListener('click', () => {
			this.emitter.emit('basket:open');
		});

		this.emitter = emitter;
	}

	setCounter(count: number): void {
		this.setText(this.counter, count.toString());
	}

	setCatalog(products: IProduct[]) {
		this.catalog.innerHTML = '';
		products.forEach((product) => {
			const cardElement = cloneTemplate<HTMLElement>('#card-catalog');
			cardElement.dataset.id = product.id;
			const card = new Card(cardElement, this.emitter, 'catalog');
			card.setTitle(product.title);
			card.setImageSrc(product.image);
			card.setPrice(product.price);
			this.catalog.append(cardElement);
			cardElement.addEventListener('click', () => {
				console.log('клик');
				this.emitter.emit('card:select', product);
			});
		});
	}

	set locked(value: boolean) {
		if (value) {
			this._wrapper.classList.add('page__wrapper_locked');
		} else {
			this._wrapper.classList.remove('page__wrapper_locked');
		}
	}
}
