import { IProduct, IBasketProduct } from '../../types';
import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement, createElement, cloneTemplate } from '../utils/utils';
import { Card } from './Card';

export class Basket extends Component<HTMLElement> {
  protected itemsContainer: HTMLElement;
  protected total: HTMLElement;
  protected orderButton: HTMLButtonElement;
  protected emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter) {
    super(container);
    this.itemsContainer = ensureElement<HTMLElement>('.basket__list', this.container);
    this.total = ensureElement<HTMLElement>('.basket__price', container);
    this.orderButton = ensureElement<HTMLButtonElement>('.basket__button', container);
    this.emitter = emitter;

    this.orderButton.addEventListener('click', () => {
      console.log('Попытка открыть корзину')
      this.emitter.emit('_order');
    });
  }

setItems(items: IBasketProduct[]): void {
  this.itemsContainer.innerHTML = ''; // Очищаем контейнер списка
  if (items.length) {
    // Если есть товары, создаем элементы корзины
    items.forEach((item, index) => {
      const itemElement = cloneTemplate<HTMLElement>('#card-basket');
      const card = new Card(itemElement, this.emitter, 'basket');
      card.setTitle(item.title);
      card.setPrice(item.price);
      itemElement.querySelector('.basket__item-index')!.textContent = (index + 1).toString();
      itemElement.querySelector('.basket__item-delete')!.addEventListener('click', () => {
        this.emitter.emit('basket:remove', { id: item.id });
      });
      this.itemsContainer.append(itemElement);
    });
  } else {
    // Если корзина пуста, добавляем сообщение
    console.log(items.length + 'мда')
    this.itemsContainer.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
  }
}

  setTotal(total: number | null): void {
    this.setText(this.total, total ? `${total} синапсов` : '0 синапсов');
  }
}