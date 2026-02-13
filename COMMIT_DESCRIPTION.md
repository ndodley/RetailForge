Commit: Initialized Kafka with Docker and tested for order payment

## Summary

Initialized local Kafka infrastructure (via Docker), added Kafka client utilities, a producer and consumer, an event envelope format, and a worker to consume order/payment events for local smoke testing. Integrated the payment route to publish order payment events so the system can process them asynchronously.

## Motivation

Enable event-driven order/payment workflows to decouple payment handling from request/response, add reliability and future extensibility for analytics, notifications, and retries.

## Files added / modified

- `docker-compose.kafka.yml` — Docker Compose file to start Kafka locally
- `backend/src/kafka/client.js` — Kafka client initialization
- `backend/src/kafka/config.js` — Kafka configuration and constants
- `backend/src/kafka/producer.js` — helper to publish events
- `backend/src/kafka/consumer.js` — helper to consume topics
- `backend/src/kafka/eventEnvelope.js` — standard event envelope format
- `backend/src/workers/kafkaWorker.js` — local consumer worker for testing
- `backend/src/routes/paymentRoutes.js` — integration point to publish payment/order events

## How to run locally (quick)

1. Ensure Docker and Docker Compose are installed.

```bash
docker compose -f docker-compose.kafka.yml up -d
```

2. In `backend/.env` enable Kafka and point to brokers:

```
KAFKA_ENABLED=true
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ORDERS=rf.orders
```

3. Start the backend worker (from `backend`):

```bash
cd backend
node src/workers/kafkaWorker.js
```

4. Trigger an order payment flow (frontend or HTTP POST to the payment endpoint). Watch the worker logs to confirm the `order.paid` event is consumed.

## Testing performed

- Brought up Kafka containers with `docker compose -f docker-compose.kafka.yml up -d`.
- Started `kafkaWorker.js` to validate it connects and consumes produced events.
- Performed a manual payment/order flow to confirm the event is emitted and processed (smoke test).

## Notes & troubleshooting

- If the worker fails with connection errors, confirm Kafka containers are healthy and reachable from Windows (check Docker network and ports).
- Check broker/consumer configuration in `backend/src/kafka/config.js` if you need to point to custom host/ports.
- Keep `.env` secrets out of version control and avoid committing large image files.

## Next steps (recommended)

- Add automated integration tests or a lightweight Kafka mock for CI.
- Add retry/backoff and health checks in the consumer/producer.
- Consider documenting the Kafka setup in `README.md` or linking this file from the README.
