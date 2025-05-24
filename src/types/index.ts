export interface IProduct{
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
};

export interface IProductList {
  total: number | null;
  items: IProduct[];
};

export interface IBasket{
  items: IBasketProduct;
  total: number | null;
}

export type IBasketProduct = Pick<IProduct, 'id' | 'title' | 'price'> & {
    isInBasket: boolean
};

export interface IOrderForm {
    payment: 'card' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number | null;
    items: Pick<IBasketProduct, 'id'>[];
};

export interface IOrderResult {
  id: string;
  total: number | null;
};

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
}

export enum AppEvents {
  CardSelect = 'card:select', 
  CatalogChanged = 'catalog:changed', 
  PreviewChanged = 'preview:changed', 
  BasketAdd = 'basket:add', 
  BasketRemove = 'basket:remove', 
  BasketChanged = 'basket:changed', 
  OrderPaymentAddressSubmit = 'order:payment_address_submit', 
  OrderPaymentAddressValidated = 'order:payment_address_validated', 
  OrderEmailPhoneSubmit = 'order:email_phone_submit', 
  OrderEmailPhoneValidated = 'order:email_phone_validated',
  OrderSuccess = 'order:success',
  ModalOpen = 'modal:open',
  ModalClose = 'modal:close', 
}

export type CardEvent = { id: string };
export type BasketEvent = { product: IProduct }; 
export type BasketChangedEvent = { basket: IBasket };
export type OrderPaymentAddressEvent = { payment: 'card' | 'cash'; address: string }; 
export type OrderEmailPhoneEvent = { email: string; phone: string }; 
export type OrderValidatedEvent = IValidationResult; 
export type OrderSuccessEvent = IOrderResult; 