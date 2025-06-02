import { IProduct, IBasket, IBasketProduct } from "../../types";
import { EventEmitter } from '../presenter/events';

export class Basket {
  private items: IBasketProduct[] = [];
  private total: number | null = null;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  addToBasket(product: IProduct): void {
    const existingProduct = this.items.find((item) => item.id === product.id);
    if (!existingProduct) {
      const basketProduct: IBasketProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        isInBasket: true,
      };
      this.items.push(basketProduct);
      this.updateTotal();
      console.log('Added to basket:', basketProduct); // Debug
      this.emitter.emit('basket:changed', this.getBasket());
    }
  }

  removeFromBasket(productId: string): void {
    this.items = this.items.filter((item) => item.id !== productId);
    this.updateTotal();
    console.log('Removed from basket, new items:', this.items); // Debug
    this.emitter.emit('basket:changed', this.getBasket());
  }

  getTotal(): number | null {
    return this.total;
  }

  getBasket(): IBasket {
    return { items: this.items, total: this.total };
  }

  setSelected(state: boolean): void {
    this.emitter.emit('basket:selected', { state });
  }

  private updateTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }
}