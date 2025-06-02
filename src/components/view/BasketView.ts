import { IProduct, IBasketProduct } from '../../types';
import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';

export class Basket extends Component<HTMLElement> {
  private itemsContainer: HTMLElement;
  private total: HTMLElement;
  private orderButton: HTMLButtonElement;
  private emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter) {
    super(container);
    this.itemsContainer = ensureElement<HTMLElement>('.basket__list', container);
    this.total = ensureElement<HTMLElement>('.basket__total', container);
    this.orderButton = ensureElement<HTMLButtonElement>('.basket__button', container);
    this.emitter = emitter;

    this.orderButton.addEventListener('click', () => {
      this.emitter.emit('basket:open_order');
    });
  }

  setItems(items: IBasketProduct[]): void {
    this.itemsContainer.innerHTML = '';
    items.forEach((item: IBasketProduct, index: number) => {
      const itemElement = document.createElement('li');
      itemElement.classList.add('basket__item');
      itemElement.innerHTML = `
        <span>${index + 1}. ${item.title} - ${item.price ?? 'Бесценно'}</span>
        <button class="basket__item-delete" data-id="${item.id}">Удалить</button>
      `;
      this.itemsContainer.append(itemElement);
    });

    this.itemsContainer.querySelectorAll('.basket__item-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.emitter.emit('basket:remove', { id: (btn as HTMLButtonElement).dataset.id });
      });
    });
  }

  setTotal(total: number | null): void {
    this.setText(this.total, total ? `${total} ₽` : '0 ₽');
  }
}