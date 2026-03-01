const { getKafka } = require('./client');
const { kafkaEnabled } = require('./config');

async function startConsumer({ groupId, topics, onMessage }) {
    if (!kafkaEnabled()) {
        throw new Error('Kafka is disabled (set KAFKA_ENABLED=true)');
    }
    if (!groupId) throw new Error('groupId is required');
    if (!Array.isArray(topics) || topics.length === 0) throw new Error('topics[] is required');
    if (typeof onMessage !== 'function') throw new Error('onMessage must be a function');

    await ensureTopicsExist(topics);

    const consumer = getKafka().consumer({ groupId });
    await consumer.connect();
    for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const valueText = message.value ? message.value.toString('utf8') : null;
            const parsed = valueText ? safeJsonParse(valueText) : null;
            await onMessage({
                topic,
                partition,
                key: message.key ? message.key.toString('utf8') : null,
                value: parsed,
                valueText,
                headers: message.headers || {},
                offset: message.offset,
                timestamp: message.timestamp,
            });
        },
    });

    return consumer;
}

async function ensureTopicsExist(topics) {
    const kafka = getKafka();
    const admin = kafka.admin();

    await admin.connect();
    try {
        await admin.createTopics({
            waitForLeaders: true,
            topics: topics.map((topic) => ({
                topic,
                numPartitions: 1,
                replicationFactor: 1,
            })),
        });
    } catch (err) {
        // If the cluster is configured to disallow topic creation, or the topic already exists,
        // we don't want to block the consumer from starting.
        // KafkaJS may throw on some broker configs; treat this as best-effort.
        console.warn('[kafka] topic ensure failed (continuing):', err?.message || err);
    } finally {
        try {
            await admin.disconnect();
        } catch {
            // ignore
        }
    }
}

function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

module.exports = {
    startConsumer,
};
