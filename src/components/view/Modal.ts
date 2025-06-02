import { Component } from "../presenter/Component";
import {ensureElement} from "../utils/utils";
import { EventEmitter } from "../presenter/events";

export class Modal extends Component<HTMLElement> {
  protected content: HTMLElement;
  private emitter: EventEmitter;

  constructor(container: HTMLElement, emitter: EventEmitter) {
    super(container);
    this.content = ensureElement<HTMLElement>('.modal__content', container);
    this.emitter = emitter;

    container.addEventListener('click', (e) => {
      if (e.target === container) this.close();
    });
  }

  open(): void {
    this.toggleClass(this.container, 'modal_active', true);
    this.emitter.emit('modal:open');
  }

  close(): void {
    this.toggleClass(this.container, 'modal_active', false);
    this.emitter.emit('modal:close');
  }

  set contentElement(content: HTMLElement) {
    this.content.innerHTML = '';
    this.content.append(content);
  }
}
