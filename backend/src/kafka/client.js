const { Kafka, logLevel } = require('kafkajs');
const { kafkaConfig } = require('./config');

let kafkaInstance;

function getKafka() {
    if (kafkaInstance) return kafkaInstance;

    const { clientId, brokers } = kafkaConfig();
    kafkaInstance = new Kafka({
        clientId,
        brokers,
        logLevel: logLevel.INFO,
    });

    return kafkaInstance;
}

module.exports = {
    getKafka,
};
