import axios from '../lib/axios';

// In-memory cache for presigned URLs keyed by object key
// Value: { url: string, expiresAt: number }
const urlCache = new Map();

const now = () => Date.now();

// Get cached url if not expired
function getFromCache(key) {
  const rec = urlCache.get(key);
  if (!rec) return null;
  if (rec.expiresAt && rec.expiresAt > now() + 5_000) {
    // Keep a 5s safety window before expiry
    return rec.url;
  }
  // Expired -> drop
  urlCache.delete(key);
  return null;
}

// Save to cache with TTL (seconds)
function setInCache(key, url, ttlSeconds) {
  const ms = (Number(ttlSeconds) || 0) * 1000;
  const expiresAt = ms > 0 ? now() + ms : now() + 280_000; // default ~4.6m
  urlCache.set(key, { url, expiresAt });
}

// Resolves a storage key to a temporary download URL using backend
// If input already looks like a URL (http/https/data), returns it as-is.
export async function getDownloadUrl(key) {
  if (!key) return '';
  // Support object shapes like { key: '...', url: '...' }
  let candidate = key;
  if (typeof key === 'object' && key !== null) {
    candidate = key.key || key.url || key.path || key.src || '';
  }
  const str = String(candidate || '');
  if (/^(https?:)?\/\//i.test(str) || /^data:/i.test(str) || str.startsWith('/')) return str;

  const cached = getFromCache(str);
  if (cached) return cached;

  try {
    const res = await axios.get('/uploads/getDownloadUrl', {
      params: { key: str }
    });
    const url = res?.data?.data?.downloadUrl || '';
    const ttl = res?.data?.data?.expiresIn || 300;
    if (url) setInCache(str, url, ttl);
    return url || '';
  } catch (e) {
    // Swallow and return empty; callers can fallback to placeholders
    return '';
  }
}

export async function getManyDownloadUrls(keys = []) {
  const results = await Promise.all(keys.map((k) => getDownloadUrl(k)));
  return results;
}

// Expose a simple cache invalidation in case needed
export function invalidateDownloadUrl(key) {
  if (!key) return;
  urlCache.delete(String(key));
}

export function clearDownloadUrlCache() {
  urlCache.clear();
}
// Get public URL for a storage key
export async function getPublicUrl(key) {
  if (!key) return '';
  const str = String(key);
  try {
    const res = await axios.get('/storage/public-url', {
      params: { key: str }
    });
    return res?.data?.data?.publicUrl || '';
  } catch (e) {
    return '';
  }
}

// Get private download URL for a storage key
export async function getPrivateDownloadUrl(key) {
  if (!key) return '';
  const str = String(key);
  try {
    const res = await axios.get('/storage/download-url', {
      params: { key: str }
    });
    return res?.data?.data?.downloadUrl || '';
  } catch (e) {
    return '';
  }
}
