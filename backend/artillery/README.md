# Artillery load testing for RetailForge (backend)

This folder contains Artillery scenarios to simulate multiple users hitting your API at the same time, plus an optional direct Kafka smoke test.

## Where this lives

All load-test code is under:

- backend/artillery/

That keeps it next to the backend (the thing you’re load testing) and lets you use the locally-installed Artillery devDependency.

## What you need running first

1. Backend API

- Your Express server listens on port 5000 by default.
- All scenarios here target `http://localhost:5000`.

2. Kafka (for Kafka-related tests)

- Your docker compose exposes Kafka at `localhost:9092`.

3. Enable Kafka publishing in the backend
   Your backend only publishes events when `KAFKA_ENABLED=true`.
   Set these env vars for the backend process:

- `KAFKA_ENABLED=true`
- `KAFKA_BROKERS=localhost:9092`

Your backend publishes to these default topics (see backend/src/kafka/config.js):

- orders: `rf.orders`
- auth: `rf.auth`
- inventory: `rf.inventory`

## The important concept (sessions)

Your login endpoint `POST /api/auth/login` writes `req.session.user_id`.
Artillery’s HTTP engine will keep cookies per virtual user, so each simulated user maintains its own session across requests.

If you ever see that sessions aren’t being kept, add the Origin header (already done in processors/common.js) and keep all requests within the same scenario flow.

## Test data: users

Edit this file to match real users in your database:

- backend/artillery/data/users.example.csv

Those users must already exist because registering new users at load-test time can hit unique-email constraints and skew results.

## Scenarios included

HTTP scenarios:

- backend/artillery/scenarios/http_browse.yml
  - Simple read-only browsing.

- backend/artillery/scenarios/http_login_failed.yml
  - Purposely invalid login.
  - If Kafka is enabled, your backend will publish `auth.login_failed` to the `rf.auth` topic.

- backend/artillery/scenarios/http_login_cart_checkout.yml
  - Login (session cookie)
  - Read `/api/auth/me` to get user id
  - Get or create cart
  - Pick a product from `/api/products`
  - Add an item to cart
  - Checkout via `/api/payment/complete-checkout`
  - If Kafka is enabled, this publishes:
    - `order.created` and `order.paid` to `rf.orders`
    - `inventory.low_stock` / `inventory.out_of_stock` to `rf.inventory` (depending on stock)

Kafka scenario (optional):

- backend/artillery/kafka/kafka_smoke.yml
  - Produces messages directly to Kafka (topic `rf.smoke`).
  - This is useful to verify Kafka throughput independent of API/database behavior.

## How to run (you run these manually)

From the backend folder, run any of these:

- `npx artillery run artillery/scenarios/http_browse.yml`
- `npx artillery run artillery/scenarios/http_login_failed.yml`
- `npx artillery run artillery/scenarios/http_login_cart_checkout.yml`

Optional direct Kafka test (requires plugin install first):

- `npm install --save-dev artillery-plugin-kafka`
- `npx artillery run artillery/kafka/kafka_smoke.yml`

## How to verify Kafka is working (end-to-end)

You already have a consumer worker at backend/src/workers/kafkaWorker.js.
Run it with env vars set (same as backend):

- `KAFKA_ENABLED=true`
- `KAFKA_BROKERS=localhost:9092`

Then run one of the scenarios that triggers events (login_failed or checkout) and watch the worker logs for events.

## Common "new to load testing" gotchas

- If `http_login_cart_checkout.yml` starts failing with 409s, you may be draining inventory (checkout decrements stock). Reduce arrivalRate/duration or restock products.
- If login doesn’t work, confirm the users in users.example.csv exist in Postgres and the passwords match.
  - The passwords in the CSV must be the users' real plaintext passwords. If you pasted bcrypt hashes from the DB into the CSV, login will always fail.
- If Kafka events are missing, confirm `KAFKA_ENABLED=true` for the backend process that is handling the requests.
- If checkout fails with an error about `/api/auth/me` returning no userId, it usually means the session cookie wasn’t stored/sent. The scenario now checks login success first, then checks `/api/auth/me` to verify cookie-based sessions work under load.
