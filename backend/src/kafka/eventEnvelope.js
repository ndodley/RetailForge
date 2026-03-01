const crypto = require('crypto');

function createEventEnvelope(eventType, data, meta = {}) {
    const eventId = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
        eventId,
        eventType,
        occurredAt: new Date().toISOString(),
        data,
        meta,
    };
}

module.exports = {
    createEventEnvelope,
};
