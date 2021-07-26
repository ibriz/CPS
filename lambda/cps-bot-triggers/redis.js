const { promisify } = require('util');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URL);
const hsetAsync = promisify(redisClient.hset).bind(redisClient);
const hgetAsync = promisify(redisClient.hget).bind(redisClient);
const hdelAsync = promisify(redisClient.hdel).bind(redisClient);
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);

redisClient.on('error', function (err) {
    console.error("Redis error encountered ", JSON.stringify(err));
});
redisClient.on('end', function () {
    console.log("Redis connection closed");
});

module.exports = {
  hsetAsync,
  hgetAsync,
  hdelAsync,
  hgetallAsync,
}