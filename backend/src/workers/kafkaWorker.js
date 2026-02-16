const { kafkaTopics } = require('../kafka/config');
const { startConsumer } = require('../kafka/consumer');

async function main() {
    const topics = kafkaTopics();

    const consumer = await startConsumer({
        groupId: process.env.KAFKA_GROUP_ID || 'retailforge-workers',
        topics: [topics.orders, topics.auth, topics.inventory].filter(Boolean),
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

            if (value.eventType === 'order.created') {
                console.log('[kafka] order created:', value.data?.orderId);
            }

            if (value.eventType === 'order.status_updated') {
                console.log('[kafka] order status updated:', value.data?.orderId, value.data?.oldStatus, '->', value.data?.newStatus);
            }

            if (value.eventType === 'user.logged_in') {
                console.log('[kafka] user logged in:', value.data?.email);
            }

            if (value.eventType === 'inventory.low_stock') {
                console.log(
                    '[kafka] inventory low stock:',
                    value.data?.productId,
                    value.data?.productName,
                    'newStock=',
                    value.data?.newStock,
                    'threshold=',
                    value.data?.threshold
                );
            }

            if (value.eventType === 'inventory.out_of_stock') {
                console.log(
                    '[kafka] inventory out of stock:',
                    value.data?.productId,
                    value.data?.productName,
                    'newStock=',
                    value.data?.newStock
                );
            }

            if (value.eventType === 'auth.login_failed') {
                console.log(
                    '[kafka] auth login failed:',
                    value.data?.email,
                    'userId=',
                    value.data?.userId,
                    'reason=',
                    value.data?.reason
                );
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
