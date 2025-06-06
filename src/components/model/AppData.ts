import { IProduct, IProductList } from '../../types';
import { EventEmitter } from '../presenter/events';
import { Api } from '../presenter/api';
import { API_URL } from '../utils/constants';

export class AppState {
	private catalog: IProduct[] = [];
	private preview: IProduct;
	private api: Api;
	private emitter: EventEmitter;

	constructor(emitter: EventEmitter) {
		this.api = new Api(API_URL);
		this.emitter = emitter;
	}

	async setCatalog(): Promise<void> {
		try {
			const data = (await this.api.get('/product')) as IProductList;
			this.catalog = (data.items || []).map((item) => ({
				...item,
				image:
					item.image && typeof item.image === 'string'
						? item.image
						: 'https://placehold.co/100x100',
			}));
			this.emitter.emit('catalog:changed', this.catalog);
		} catch (error) {
			console.error('Failed to fetch catalog:', error);
			this.catalog = [];
			this.emitter.emit('catalog:changed', this.catalog);
		}
	}

	setPreview(product: IProduct | null): void {
		this.preview = product;
		this.emitter.emit('preview:changed', this.preview);
	}

	getCatalog(): IProduct[] {
		return this.catalog;
	}
}
