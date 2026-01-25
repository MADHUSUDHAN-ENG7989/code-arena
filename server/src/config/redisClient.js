const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://default:A65ckVkLUJSzUVCKyXNH29NhMZvjNOof@redis-12815.c264.ap-south-1-1.ec2.cloud.redislabs.com:12815';

const client = createClient({
    url: REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Retry Limit Exceeded');
            return Math.min(retries * 50, 2000);
        }
    }
});

client.on('error', (err) => console.error('[REDIS] Client Error:', err));
client.on('connect', () => console.log('[REDIS] Connected successfully'));

// Connect immediately
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('[REDIS] Connection failed:', err);
    }
})();

module.exports = client;
