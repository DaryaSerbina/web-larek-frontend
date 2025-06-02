import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { Card } from './Card';
import { IProduct } from '../../types';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { Basket } from '../model/Basket';

export class Page extends Component<HTMLElement> {
  protected counter: HTMLElement;
  private catalog: HTMLElement;
  private emitter: EventEmitter;
  private basket: Basket;

  constructor(container: HTMLElement, emitter: EventEmitter, basket: Basket) {
    super(container);
    this.counter = ensureElement<HTMLElement>('.header__basket-counter', container);
    this.catalog = ensureElement<HTMLElement>('.gallery', container);
    this.emitter = emitter;
    this.basket = basket;
  }

  setCounter(count: number): void {
    this.setText(this.counter, count.toString());
  }

  setCatalog(products: IProduct[]): void {
    console.log('Rendering catalog with products:', products); // Debug
    this.catalog.innerHTML = '';
    products.forEach((product) => {
      const cardElement = cloneTemplate<HTMLElement>('#card-catalog');
      const card = new Card(cardElement, this.emitter, 'catalog');
      card.setTitle(product.title);
      card.setImageSrc(product.image);
      card.setPrice(product.price);
      cardElement.dataset.id = product.id;
      const isInBasket = this.basket.getBasket().items.some((item) => item.id === product.id);
      card.setButtonText(isInBasket ? 'В корзине' : 'Купить');
      this.catalog.append(cardElement);
      cardElement.addEventListener('click', () => {
        this.emitter.emit('card:select', product);
      });
    });
  }
}