import { nanoid } from 'nanoid';

// Generate a readable custom id prefixed by model code (e.g. USR-abc123)
export function generateId(prefix = 'ID') {
    return `${prefix}-${nanoid(10)}`;
}
