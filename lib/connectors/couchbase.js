import {Cluster as CouchbaseCluster, Mock} from 'couchbase';
import config from '../config';
import {Cache} from 'memory-cache';

const Cluster = process.env.NODE_ENV === 'test' ? Mock.Cluster : CouchbaseCluster;
const cluster = new Cluster('couchbase://' + config.couchbaseHost);
let buckets = {};
let bucketsConfig: Object = undefined;
let statusBuckets: [string] = undefined;

export const cache = new Cache();

export function clear() {
  buckets = {};
  bucketsConfig = undefined;
  statusBuckets = undefined;
}

export function initCouchbase(_bucketsConfig: Object, _statusBuckets: [string] | string) {
  bucketsConfig = _bucketsConfig;
  statusBuckets = Array.isArray(_statusBuckets) ? _statusBuckets : [_statusBuckets];
}

function getBucket(bucket) {
  if (!buckets[bucket]) {
    buckets[bucket] = cluster.openBucket(bucket);
  }
  return buckets[bucket];
}

export async function getStatus() {
  let isConnected = true;
  statusBuckets.forEach((bucket) => {
    if (!getBucket(bucket).connected) {
      isConnected = false;
    }
  });
  return {couchbase: isConnected};
}

export async function getWithCache(bucketKey: string, key: string): Promise<Object> {
  const bucketConfig = bucketsConfig[bucketKey];
  const getKey = bucketConfig.buildKey(key);

  let value = cache.get(getKey);
  if (!value || config.envName !== 'prod') {
    value = await get(bucketKey, key);
    cache.put(getKey, value, config.MEMORY_CACHE_TTL_MS);
  }

  return value;
}

export function get(bucketKey: string, key: string): Promise<Object> {
  const bucketConfig = bucketsConfig[bucketKey];
  const getKey = bucketConfig.buildKey(key);

  return new Promise((resolve, reject) => {
    getBucket(bucketConfig.bucket).get(getKey, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result.value);
    });
  });
}

export function put(bucketKey: string, key: string, value: Promise<Object>) {
  const bucketConfig = bucketsConfig[bucketKey];
  const keyOpts = Object.assign({}, bucketConfig.opts) || {};
  const putKey = bucketConfig.buildKey(key);

  return new Promise((resolve, reject) => {
    getBucket(bucketConfig.bucket).upsert(putKey, value, keyOpts, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

export function initCounter(bucketKey: string, value: string, initialValue: number): Promise<Object> {
  return new Promise((resolve, reject) => {
    const bucketConfig = bucketsConfig[bucketKey];
    const keyOpts = Object.assign({}, bucketConfig.opts, {initial: initialValue});
    const incrementKey = bucketConfig.buildKey(value);
    const bucket = getBucket(bucketConfig.bucket);

    bucket.counter(incrementKey, 1, keyOpts, (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result.value);
    });
  });
}

export function increment(bucketKey: string, value: string): Promise<Object> {
  return new Promise((resolve, reject) => {
    const bucketConfig = bucketsConfig[bucketKey];
    const keyOpts = Object.assign({}, bucketConfig.opts) || {};
    const incrementKey = bucketConfig.buildKey(value);
    const bucket = getBucket(bucketConfig.bucket);

    bucket.counter(incrementKey, 1, keyOpts, (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result.value);
    });
  });
}
