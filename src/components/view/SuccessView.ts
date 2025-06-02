import { Component } from '../presenter/Component';
import { EventEmitter } from '../presenter/events';
import { ensureElement } from '../utils/utils';

export class SuccessView extends Component<HTMLElement> {
  private total: HTMLElement;
  private closeButton: HTMLButtonElement;
  private emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter) {
    super(container);
    this.total = ensureElement<HTMLElement>('.order-success__total', container);
    this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
    this.emitter = emitter;

    this.closeButton.addEventListener('click', () => this.handleCloseClick());
  }

  setTotal(total: number | null): void {
    this.setText(this.total, total ? `${total} ₽` : '0 ₽');
  }

  handleCloseClick(): void {
    this.emitter.emit('success:close');
  }
}