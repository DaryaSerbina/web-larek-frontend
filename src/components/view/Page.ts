import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';
import { Basket } from '../model/Basket';

export class Page extends Component<HTMLElement> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _emitter: EventEmitter;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, emitter: EventEmitter, basket: Basket) {
		super(container);
		this._counter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			container
		);
		this._catalog = ensureElement<HTMLElement>('.gallery', container);
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLElement>('.header__basket');

		this._basket.addEventListener('click', () => {
			this._emitter.emit('basket:open');
		});

		this._emitter = emitter;
	}

	setCounter(count: number): void {
		this.setText(this._counter, count.toString());
	}

	setCatalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items); // Просто вставляет готовые элементы
	}

	set locked(value: boolean) {
		if (value) {
			this._wrapper.classList.add('page__wrapper_locked');
		} else {
			this._wrapper.classList.remove('page__wrapper_locked');
		}
	}
}
