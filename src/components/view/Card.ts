import { EventEmitter } from '../presenter/events';
import { Component } from '../presenter/Component';
import { ensureElement } from '../utils/utils';
import { CDN_URL } from '../utils/constants';

export class Card extends Component<HTMLElement> {
	protected _title: HTMLElement;
	protected _image: HTMLImageElement | null;
	protected _price: HTMLElement;
	protected _category: HTMLElement | null;
	protected _description: HTMLElement | null;
	protected _button: HTMLButtonElement | null;
	protected _emitter: EventEmitter;

	constructor(
		container: HTMLElement,
		emitter: EventEmitter,
		type: 'catalog' | 'preview' | 'basket'
	) {
		super(container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._image = container.querySelector('.card__image');
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._category = container.querySelector('.card__category');
		this._description = container.querySelector('.card__text');
		this._button = container.querySelector('.card__button');
		this._emitter = emitter;

		if (this._button && type !== 'catalog') {
			this._button.addEventListener('click', () => {
				const id = this.container.dataset.id;
				if (id) {
					this._emitter.emit(
						type === 'basket' ? 'basket:remove' : 'basket:add',
						{ id }
					);
				}
			});
		}
	}

	setTitle(value: string) {
		this.setText(this._title, value);
	}

	setCategory(value: string) {
		this.setText(this._category, value);
		if (this._category) {
			this._category.className = `card__category card__category_${this.categoryColors[value]}`;
		}
	}

	setImageSrc(src: string, alt: string = 'Product image') {
		if (this._image) {
			this._image.src = CDN_URL + src;
			this._image.alt = alt;
		}
	}

	setPrice(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
	}

	setDescription(value: string) {
		if (this._description) this.setText(this._description, value);
	}

	setButtonText(value: string) {
		if (this._button) this.setText(this._button, value);
	}
}
