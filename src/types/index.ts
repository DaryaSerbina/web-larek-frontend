export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IProductList {
  total: number | null;
  items: IProduct[];
}

export interface IBasketProduct {
  id: string;
  title: string;
  price: number | null;
  isInBasket: boolean;
}

export interface IBasket {
  items: IBasketProduct[];
  total: number | null;
}

export interface IOrderForm {
  payment: 'card' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number | null;
  items: Pick<IBasketProduct, 'id'>[];
}

export interface IOrderResult {
  id: string;
  total: number | null;
}

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
}