# Теоретична схема Kubernetes-застосунку: Online Shop

## 1. Сервіс

**Online Shop** — невеликий онлайн-магазин на Node.js (Express 5) з базою SQLite. Сервіс надає каталог товарів (повний CRUD на `/items`), створення замовлень з ідемпотентністю (`POST /orders`) і перевірку стану (`GET /health`). Користувач — покупець, який переглядає товари й оформлює замовлення через веб-клієнт, що віддається тим самим сервісом на порту 3000.

## 2. Схема

Mermaid_diagram

## 3. Пояснення елементів

### Зовнішня частина

| Елемент | Що робить |
|---|---|
| **User / Browser** | Покупець відкриває `https://shop.example.com`. |
| **DNS** | Перетворює домен `shop.example.com` на публічну IP-адресу Load Balancer (A-запис). |
| **Load Balancer** | Приймає зовнішній трафік і передає його на Ingress Controller у кластері. |
| **Ingress Controller** | За правилами Ingress (Host `shop.example.com`, Path `/`) маршрутизує запити до внутрішнього Service. За потреби можна розділити шляхи `/items` і `/orders`. |

### Всередині кластера

| Елемент | Що робить |
|---|---|
| **Cluster / Node** | Кластер складається з Node (машин). Pod-и розподіляються між двома worker-нодами. |
| **Namespace `shop-prod`** | Ізольований простір імен, де живуть усі ресурси сервісу. Для інших середовищ можна створити `shop-stage`. |
| **Deployment `online-shop-api`** | Описує бажаний стан: 2 репліки образу `online-shop:1.0.0`. Через ReplicaSet стежить, щоб Pod-ів завжди було 2. |
| **Service `online-shop-svc`** | Стабільна внутрішня адреса (ClusterIP, порт 80 → 3000). Розподіляє трафік між усіма здоровими Pod-ами. Інші сервіси можуть звертатися за DNS-ім'ям `http://online-shop-svc`. |
| **Pod-и** | Запущені екземпляри застосунку, кожен із контейнером `online-shop:1.0.0`. Мають liveness/readiness-перевірки на `GET /health`. |
| **ConfigMap `shop-config`** | Конфігурація без секретів: `FAIL_RATE`, `SLOW_RATE`. Підключається до Pod-ів як змінні оточення. Для реальних секретів (токени, паролі БД) використовується Secret. |

### Від коду до Pod-а

| Елемент | Що робить |
|---|---|
| **Git** | Зберігає код (`github.com/Andoriydess/online-shop`). Зміни йдуть через гілки та pull request у `main`. |
| **CI/CD (GitHub Actions)** | Після push або merge запускає lint і тести, збирає Docker-образ і публікує його в registry. |
| **Container registry (GHCR)** | Зберігає образи з тегами `v1.0.0` та `sha-<commit>`. Pod-и завантажують образ звідси під час старту. |

## 4. Шлях запиту

`Client → DNS → Load Balancer → Ingress → Service → Pod`

1. Браузер звертається до `shop.example.com`, DNS повертає IP Load Balancer.
2. Load Balancer передає запит на Ingress Controller.
3. Ingress за host і path вибирає Service `online-shop-svc`.
4. Service обирає один зі здорових Pod-ів і перенаправляє запит на порт 3000.
5. Express у Pod-і обробляє запит (наприклад, `GET /items`) і повертає відповідь тим самим шляхом назад.

## 5. Короткий опис дизайну

Я моделюю сервіс **Online Shop** (Node.js/Express із SQLite), який віддає каталог товарів і приймає замовлення. У кластері він живе в namespace `shop-prod`. Ззовні трафік іде так: користувач → DNS (`shop.example.com`) → Load Balancer → Ingress, який за host і path маршрутизує запит до Service `online-shop-svc` (ClusterIP), а той розподіляє його між Pod-ами. Я заклав 2 Pod-и в Deployment `online-shop-api` для базової відмовостійкості: якщо один Pod впаде, другий продовжить обслуговувати запити, а Deployment створить заміну. Код лежить у git-репозиторії; після push GitHub Actions проганяє тести, збирає Docker-образ і публікує його в GHCR (`ghcr.io/andoriydess/online-shop:1.0.0`), звідки Pod-и тягнуть образ під час старту.

## 6. Обмеження поточного дизайну та майбутні покращення

- **Стан у Pod-і.** SQLite-файл `shop.db`, мапа ідемпотентності та rate-limit зберігаються в самому Pod-і. При 2 репліках кожен Pod має власну копію цього стану, тому той самий `Idempotency-Key`, потрапивши на інший Pod, міг би створити дубль замовлення.
- **Рішення для продакшну:** винести БД в окремий PostgreSQL (StatefulSet або керований сервіс), а ідемпотентні ключі та лічильники rate-limit зберігати в спільному сховищі (таблиця в БД або Redis). Тоді репліки ділитимуть єдиний стан.
- **Майбутні модулі** (з бізнес-документа): Auth, Payments, Notifications. Кожен міг би стати окремим Deployment + Service у тому самому namespace.
- **Масштабування:** додати HorizontalPodAutoscaler, а також Secret для чутливих налаштувань.

## 7. Додаток: приблизні маніфести (для довідки, не розгортаються)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: online-shop-api
  namespace: shop-prod
spec:
  replicas: 2
  selector:
    matchLabels: { app: online-shop }
  template:
    metadata:
      labels: { app: online-shop }
    spec:
      containers:
        - name: online-shop
          image: ghcr.io/andoriydess/online-shop:1.0.0
          ports: [{ containerPort: 3000 }]
          envFrom:
            - configMapRef: { name: shop-config }
          readinessProbe:
            httpGet: { path: /health, port: 3000 }
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
---
apiVersion: v1
kind: Service
metadata:
  name: online-shop-svc
  namespace: shop-prod
spec:
  type: ClusterIP
  selector: { app: online-shop }
  ports: [{ port: 80, targetPort: 3000 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: online-shop-ingress
  namespace: shop-prod
spec:
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: online-shop-svc
                port: { number: 80 }
```
