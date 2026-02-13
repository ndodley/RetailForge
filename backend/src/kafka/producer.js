const { getKafka } = require('./client');
const { kafkaEnabled } = require('./config');

let producerPromise;

async function getProducer() {
    if (!kafkaEnabled()) return null;
    if (producerPromise) return producerPromise;

    const producer = getKafka().producer();
    producerPromise = producer.connect().then(() => producer);
    return producerPromise;
}

async function publishJson({ topic, key, value, headers }) {
    const producer = await getProducer();
    if (!producer) return;

    await producer.send({
        topic,
        messages: [
            {
                key: key == null ? undefined : String(key),
                value: JSON.stringify(value),
                headers,
            },
        ],
    });
}

module.exports = {
    getProducer,
    publishJson,
};
