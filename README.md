# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
``` 

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Описание данных

 Интернет-магазин с товарами для веб-разработчиков — Web-ларёк. В нём можно посмотреть каталог товаров, добавить товары в корзину и сделать заказ. 
                              Интерфейсы данных
IProduct: используется для хранения данных о товаре в каталоге и при просмотре.
Поля: 
id (string) - идентификатор, 
description (string) - описание товара, 
image (string) - картинка товара, 
title (string) - название товара, 
category (string) - категория товара, 
price (number | null) - цена товара.

IProductList: используется для получения списка товаров с сервера.
Поля: 
total (number | null) - количество всех товаров в корзине,
 items (IProduct[]) - список товаров.

IBasket: используется для хранения и отображения товаров в корзине.
Поля: 
items (IBasketProduct[]) - список товаров в корзине, 
total (number | null) - сумма заказа.

IBasketProduct: используется для отображения товаров в корзине с состоянием.
Поля: id (string), title (string), price (number | null) - идентификатор, описание и цена товара из списка, 
isInBasket (boolean) - если true, то отображается в корзине.

IOrderForm: используется для хранения и отправки данных заказа.
Поля: 
payment ('card' | 'cash') - оплата онлайн или при получении, 
email (string) - почта пользователя, 
phone (string) - телефон пользователя,
address (string) - адрес пользователя, 
total (number | null) - сумма заказа, 
items (Pick<IBasketProduct, 'id'>[] - список идентификаторов товаров в корзине).

IOrderResult: используется для отображения успешного заказа.
Поля: 
id (string) - идентификатор, 
total (number | null) - сумма заказа.

IValidationResult: для отображения ошибок валидации в формах.
Поля: 
isValid (boolean) - проверяет валидность,
errors (string[]) - передает ошибку.

                              Presenter
Класс EventEmitter - реализует паттерн «Наблюдатель» для асинхронного взаимодействия компонентов. Используется для координации между моделью и отображением.
Методы:
  on(event, callback): подписка на событие.
  off(event, callback): отписка от события.
  emit(event, data): вызов события с передачей данных.
  onAll(callback): подписка на все события.
  offAll(): сброс всех подписчиков.

Класс ApiClient - отвечает за взаимодействие с API.
Методы:
  get<T>(endpoint): получение данных (например, каталога товаров).
  post<T>(endpoint, data): отправка данных (например, заказа).

Класс Component - абстрактный базовый класс для всех компонентов представления. Используется для упрощения работы с DOM.
Методы:
  setText(element, value): установка текстового содержимого.
  setImage(element, src, alt): установка изображения.
  toggleClass(element, className, force): управление классами.
  setDisabled(element, state): управление состоянием кнопок.

                               Model        
Класс AppData - хранит состояние приложения, каталог товаров и текущий просматриваемый товар. Генерирует события: catalog:changed, preview:changed.
Методы:
  setCatalog(products: IProduct[]): загружает каталог товаров из API.
  setPreview(product: IProduct | null): устанавливает товар для просмотра в модальном окне.

Класс Basket - управляет содержимым корзины: добавление/удаление товаров, расчёт общей суммы. Генерирует событие: basket:changed.
Методы:
  addToBasket(product: IProduct): добавляет товар в корзину.
  removeFromBasket(productId: string): удаляет товар из корзины.
  getTotal(): возвращает общую сумму.
  setSelected(state: boolean): управляет состоянием кнопки заказа.

Класс Order - управляет данными заказа: адрес, способ оплаты, почту, телефон. Генерирует события: order:payment_address_submit, order:email_phone_submit, order:success.
Методы:
  setPayment(payment: 'card' | 'cash'): устанавливает способ оплаты.
  setAddress(address: string): устанавливает адрес доставки.
  setEmail(email: string): устанавливает почту.
  setPhone(phone: string): устанавливает телефон.
  validateOrder(): проверяет корректность данных, возвращает { isValid: boolean, errors: string[] }.
  submitOrder(): отправляет заказ через API.

                               View 
Класс Page - отображает главную страницу: каталог товаров и счётчик корзины. Генерирует событие: card:select при клике на карточку товара.
Методы:
  setCounter(count: number): обновляет счётчик товаров в корзине.
  setCatalog(products: IProduct[]): отображает каталог товаров.

Класс Card - отображает карточку товара (название, цена, изображение, кнопка «Купить»). Генерирует события: card:select, basket:add, basket:remove.
Методы:
  setTitle(value: string): устанавливает название.
  setImage(src: string): устанавливает изображение.
  setPrice(value: number): устанавливает цену.
  setButtonText(value: string): обновляет текст кнопки («Купить» или «В корзине»).
  handleDeleteClick(): void: обработчик клика по кнопке с иконкой мусорной корзинки, генерирует событие basket:remove.
 

Класс BasketView - отображает содержимое корзины: список товаров и общую сумму.
Методы:
  setItems(items: IProduct[]): обновляет список товаров.
  setTotal(total: number): отображает общую сумму.

Класс Modal - управляет модальными окнами (для просмотра товара или оформления заказа). Генерирует события: modal:open, modal:close.
Методы:
  open(): открывает окно.
  close(): закрывает окно.
  setContent(content: HTMLElement): устанавливает содержимое.

Класс FormPaymentAddress - форма первого шага заказа (адрес и способ оплаты). Генерирует событие: order:payment_address_submit.
Методы:
  setValid(isValid: boolean): управляет состоянием кнопки «Далее».
  setErrors(errors: string[]): отображает ошибки валидации.

Класс FormEmailPhone - Форма второго шага заказа (email и телефон). Генерирует событие: order:email_phone_submit.
Методы:
  setValid(isValid: boolean): управляет состоянием кнопки «Оплатить».
  setErrors(errors: string[]): отображает ошибки валидации.

Класс SuccessView - для отображения финального сообщения об успешном оформлении заказа. Показывает текст, что заказ оформлен, сумму заказа и кнопку «За новыми покупками!». Генерирует событие success:close.
Методы:
setTotal(total: number | null): устанавливает сумму заказа.
handleCloseClick(): void: обработчик клика по кнопке «За новыми покупками!». 

                               Взаимодействие компонентов
  Загрузка каталога:
AppData запрашивает товары через ApiClient и вызывает событие catalog:changed.
Page подписывается на событие и обновляет каталог с помощью setCatalog.
  Просмотр товара:
При клике на карточку (Card) генерируется событие card:select.
AppData обрабатывает событие, устанавливает товар в preview и вызывает preview:changed.
Modal открывается и отображает данные товара.
  Добавление в корзину:
При клике на «Купить» (Card) генерируется событие basket:add.
Basket добавляет товар и вызывает basket:changed.
BasketView и Page обновляют отображение корзины и счётчика.
  Оформление заказа:
Форма первого шага (FormPaymentAddress) собирает адрес и способ оплаты, генерирует order:payment_address_submit.
Order валидирует данные, и если всё корректно, открывается FormEmailPhone.
Форма второго шага собирает email и телефон, генерирует order:email_phone_submit.
Order отправляет заказ через ApiClient, очищает корзину и вызывает order:success.

                               Описание событий
Используется брокер событий (EventEmitter) для связи моделей и представлений.

События, связанные с изменением данных:
  catalog:changed: - обновление каталога на главной странице (Page.setCatalog).
  preview:changed: - отображение товара в модальном окне (Modal.setContent).
  basket:changed: - обновление корзины (BasketView.updateBasket) и счётчика (Page.setCounter).
  order:payment_address_validated: - обновление формы запроса метода оплаты и адреса (FormPaymentAddress.setValid, FormPaymentAddress.setErrors).
  order:email_phone_validated: - обновление формы запросы почты и телефона(FormEmailPhone.setValid, FormEmailPhone.setErrors).
  order:success:- отображение подтверждения заказа (SuccessView.showSuccess).
События, генерируемые действиями пользователя:
  card:select: - установка товара для просмотра (AppData.setPreview).
  basket:add: - добавление товара в корзину (Basket.addToBasket).
  basket:remove: - удаление товара из корзины (Basket.removeFromBasket).
  order:payment_address_submit: - валидация формы запроса метода оплаты и адреса заказа (Order.validatePaymentAddress).
  order:email_phone_submit: - валидация и отправка заказа (Order.validateEmailPhone, Order.submitOrder).
  modal:open: - открытие модального окна (Modal.open).
  modal:close:- закрытие модального окна (Modal.close).
  success:close - закрывает модальное окно при клике на кнопку «За новыми покупками!».
