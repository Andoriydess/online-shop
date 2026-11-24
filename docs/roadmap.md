# Roadmap

## Тиждень 3: новий endpoint
- Додати `GET /items/:id` (деталі товару).
- Додати в таблицю `items` поля `price` та `description`.
- Оновити клієнт: показувати ціну.

## Тиждень 4: базова авторизація
- Таблиця `users` (id, email, password_hash, role).
- Endpoints `POST /register` та `POST /login`.
- Захист адмін-операцій за роллю.

## Тиждень 5: CRUD для товарів
- `POST /items`, `PUT /items/:id`, `DELETE /items/:id`.
- Форма додавання та редагування товару на клієнті.
- Базова валідація вхідних даних.