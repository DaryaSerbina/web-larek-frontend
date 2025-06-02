import { EventEmitter } from "../presenter/events";
import { Component } from "../presenter/Component";
import { ensureElement } from "../utils/utils";

export class Card extends Component<HTMLElement> {
  private title: HTMLElement;
  private image: HTMLImageElement | null; // Allow null
  private price: HTMLElement;
  private description: HTMLElement | null;
  private button: HTMLButtonElement;
  private emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter, templateType: 'catalog' | 'preview' | 'basket') {
    super(container);
    this.title = ensureElement<HTMLElement>('.card__title', container);
    this.image = container.querySelector('.card__image') as HTMLImageElement | null; // Allow null
    this.price = ensureElement<HTMLElement>('.card__price', container);
    this.description = container.querySelector('.card__description');
    this.button = ensureElement<HTMLButtonElement>('.card__button', container);
    this.emitter = emitter;

    this.button.addEventListener('click', () => {
      this.emitter.emit(templateType === 'basket' ? 'basket:remove' : 'basket:add', { id: container.dataset.id });
    });
  }

  setTitle(value: string): void {
    this.setText(this.title, value);
  }

  setImage(element: HTMLImageElement, src: string, alt: string = 'Product image'): void {
    this.setImage(element, src, alt);
  }

  setPrice(value: number | null): void {
    this.setText(this.price, value ? `${value} ₽` : 'Бесценно');
  }

  setDescription(value: string): void {
    if (this.description) {
      this.setText(this.description, value);
    }
  }

  setButtonText(value: string): void {
    this.setText(this.button, value);
  }

  setImageSrc(src: string, alt: string = 'Product image'): void {
    if (this.image) {
      console.log('Setting image src:', src); // Debug
      this.setImage(this.image, src, alt);
    } else {
      console.warn('Image element not found in card'); // Debug
    }
  }

  handleDeleteClick(): void {
    this.emitter.emit('basket:remove', { id: this.container.dataset.id });
  }
}