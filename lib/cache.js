const crypto = require('crypto');

const DEFAULT_TTL = 5 * 60 * 1000;

const cache = new Map();

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.value;
}

function set(key, value, ttl = DEFAULT_TTL) {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { value, expiresAt });
}

function clear() {
  cache.clear();
}

function stats() {
  let active = 0;
  let expired = 0;
  const now = Date.now();
  
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    size: cache.size,
    active,
    expired,
    totalEvictions: expired
  };
}

function hashText(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

module.exports = {
  get,
  set,
  clear,
  stats,
  hashText,
  DEFAULT_TTL
};
