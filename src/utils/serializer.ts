import type { Serializer } from 'pinia-plugin-persistedstate';

export const dateSerializer: Serializer = {
    serialize: JSON.stringify,
    deserialize: (parseString: string) => {
        return JSON.parse(parseString, (_, value) => {
            // RegEx to detect standard ISO 8601 date strings
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
            if (typeof value === 'string' && isoDateRegex.test(value)) {
                return new Date(value);
            }
            return value;
        });
    },
};
