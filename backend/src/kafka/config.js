// Ensure backend/.env is loaded for any process that uses Kafka helpers
// (e.g., the kafka worker is not importing db.js, so it won't otherwise load dotenv).
try {
    // eslint-disable-next-line global-require
    require('dotenv').config();
} catch {
    // ignore
}

function parseCsv(value) {
    if (!value) return [];
    return String(value)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function kafkaEnabled() {
    return String(process.env.KAFKA_ENABLED || '').toLowerCase() === 'true';
}

function kafkaConfig() {
    return {
        enabled: kafkaEnabled(),
        brokers: parseCsv(process.env.KAFKA_BROKERS || 'localhost:9092'),
        clientId: process.env.KAFKA_CLIENT_ID || 'retailforge-backend',
    };
}

function kafkaTopics() {
    return {
        orders: process.env.KAFKA_TOPIC_ORDERS || 'rf.orders',
    };
}

module.exports = {
    kafkaConfig,
    kafkaEnabled,
    kafkaTopics,
};
