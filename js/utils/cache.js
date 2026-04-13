function createExpiringCache(ttlMs = 3600000) {
    const data = new Map();

    return {
        clear() {
            data.clear();
        },
        get(key) {
            const cachedItem = data.get(key);
            if (!cachedItem) {
                return null;
            }

            if (Date.now() - cachedItem.timestamp > ttlMs) {
                data.delete(key);
                return null;
            }

            return cachedItem.value;
        },
        set(key, value) {
            data.set(key, {
                value,
                timestamp: Date.now()
            });
        }
    };
}

export { createExpiringCache };
