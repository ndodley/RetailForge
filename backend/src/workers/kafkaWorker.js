const { kafkaTopics } = require('../kafka/config');
const { startConsumer } = require('../kafka/consumer');

async function main() {
    const topics = kafkaTopics();

    const consumer = await startConsumer({
        groupId: process.env.KAFKA_GROUP_ID || 'retailforge-workers',
        topics: [topics.orders],
        onMessage: async ({ topic, key, value, valueText }) => {
            const eventType = value?.eventType || 'unknown';
            console.log(`[kafka] topic=${topic} key=${key} type=${eventType}`);
            if (!value) {
                console.log('[kafka] raw:', valueText);
                return;
            }

            if (value.eventType === 'order.paid') {
                console.log('[kafka] order paid:', value.data?.orderId);
            }
        },
    });

    const shutdown = async () => {
        try {
            await consumer.disconnect();
        } catch {
            // ignore
        }
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch((err) => {
    console.error('[kafka] worker failed:', err);
    process.exit(1);
});
