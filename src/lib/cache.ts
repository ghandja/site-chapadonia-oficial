import { LRUCache } from "lru-cache";

export const spriteCache = new LRUCache<string, { data: Buffer; type: string }>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
  fetchMethod: undefined,
});

export const queryCache = new LRUCache<string, unknown>({
  max: 200,
  ttl: 1000 * 60 * 5,
});
