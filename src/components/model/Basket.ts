import { IProduct, IBasket, IBasketProduct } from '../../types';
import { EventEmitter } from '../presenter/events';

export class Basket {
	protected _items: IBasketProduct[] = [];
	protected _total: number | null = null;
	protected _emitter: EventEmitter;

	constructor(emitter: EventEmitter) {
		this._emitter = emitter;
	}

	addToBasket(product: IProduct): void {
		const existingProduct = this._items.find((item) => item.id === product.id);
		if (!existingProduct) {
			const basketProduct: IBasketProduct = {
				id: product.id,
				title: product.title,
				price: product.price,
				isInBasket: true,
			};
			this._items.push(basketProduct);
			this.updateTotal();
			this._emitter.emit('basket:changed', this.getBasket());
		}
	}

	removeFromBasket(productId: string): void {
		this._items = this._items.filter((item) => item.id !== productId);
		this.updateTotal();
		this._emitter.emit('basket:changed', this.getBasket());
	}

	clearBasket(): void {
		const lastTotal = this._total;
		this._items = [];
		this._total = null;
		this._emitter.emit('basket:changed', { items: [], total: lastTotal });
	}

	getTotal(): number | null {
		return this._total;
	}

	getBasket(): IBasket {
		return { items: this._items, total: this._total || null };
	}

	setSelected(state: boolean): void {
		this._emitter.emit('basket:selected', { state });
	}

	updateTotal(): void {
		this._total = this._items.reduce((sum, item) => sum + (item.price ?? 0), 0);
	}
}
