# Сутності та атрибути

## Піддомен: Користувачі
**User**
- id
- email
- passwordHash
- role (guest | customer | admin)

## Піддомен: Каталог
**Product**
- id
- name
- price
- description
- categoryId

**Category**
- id
- name

## Піддомен: Замовлення
**Cart**
- id
- userId
- items: CartItem[]

**CartItem**
- productId
- quantity

**Order**
- id
- userId
- items: OrderItem[]
- status (new | paid | shipped | cancelled)
- createdAt

**OrderItem**
- productId
- productName
- unitPrice
- quantity

## Піддомен: Оплата
**Payment**
- id
- orderId
- amount
- status (pending | success | failed)

## Піддомен: Доставка
**Delivery**
- id
- orderId
- address
- status (preparing | in_transit | delivered)