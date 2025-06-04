import { EventEmitter } from "../presenter/events";
import { Component } from "../presenter/Component";
import { ensureElement } from "../utils/utils";
import { CDN_URL } from "../utils/constants";

export class Card extends Component<HTMLElement> {
  private title: HTMLElement;
  private image: HTMLImageElement | null;
  private price: HTMLElement;
  private category: HTMLElement | null;
  private description: HTMLElement | null;
  private button: HTMLButtonElement | null;
  private emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter, type: 'catalog' | 'preview' | 'basket') {
    super(container);
    this.title = ensureElement<HTMLElement>('.card__title', container);
    this.image = container.querySelector('.card__image');
    this.price = ensureElement<HTMLElement>('.card__price', container);
    this.category = container.querySelector('.card__category');
    this.description = container.querySelector('.card__description');
    this.button = container.querySelector('.card__button');
    this.emitter = emitter;

    if (this.button && type !== 'catalog') {
      this.button.addEventListener('click', () => {
        const id = this.container.dataset.id;
        if (id) {
          this.emitter.emit(type === 'basket' ? 'basket:remove' : 'basket:add', { id });
        }
      });
    }
  }

  setTitle(value: string) {
    this.setText(this.title, value);
  }

  setCategory(value: string) {
    if (this.category) this.setText(this.category, value);
  }

  setImageSrc(src: string, alt: string = 'Product image') {
    if (this.image) {
      this.image.src = CDN_URL + src;
      this.image.alt = alt;
    }
  }

  setPrice(value: number | null) {
    this.setText(this.price, value ? `${value} синапсов` : 'Бесценно');
  }

  setDescription(value: string) {
    if (this.description) this.setText(this.description, value);
  }

  setButtonText(value: string) {
    if (this.button) this.setText(this.button, value);
  }
}