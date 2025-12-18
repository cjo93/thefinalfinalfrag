
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure this key is 32 bytes. In prod, load from env.
// For dev, we'll derive or use a fallback if env is short/missing, but warn heavily.
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'dev-secret-key-must-be-32-bytes-long!';

// Validating key length
const getKey = () => {
    if (SECRET_KEY.length === 32) return SECRET_KEY;
    // Pad or slice for dev safety (DO NOT DO THIS IN PROD)
    return Buffer.alloc(32, SECRET_KEY).toString('utf-8');
};

export const encrypt = (text: string): { iv: string, content: string, tag: string } => {
    const iv = crypto.randomBytes(12); // GCM standard IV size
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        content: encrypted,
        tag: tag.toString('hex')
    };
};

export const decrypt = (encrypted: { iv: string, content: string, tag: string }): string => {
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(encrypted.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));

    let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
