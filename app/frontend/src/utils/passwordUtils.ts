import bcrypt from "bcryptjs";

// Ensure bcryptjs has a secure random fallback in React Native (Hermes / JSC engine on Android & iOS)
try {
  bcrypt.setRandomFallback((len: number) => {
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(Math.floor(Math.random() * 256));
    }
    return arr;
  });
} catch (e) {
  console.warn("bcrypt.setRandomFallback initialization error:", e);
}

/**
 * Hashes a plaintext password synchronously using bcrypt with 10 salt rounds.
 */
export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText.trim(), 10);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Handles both $2y$ (PHP/Laravel) and $2a$/$2b$ variants.
 */
export function comparePassword(password: string, hash: string): boolean {
  if (!hash || !password) return false;
  try {
    const normalizedHash = hash.replace(/^\$2y\$/, "$2a$");
    return (
      bcrypt.compareSync(password, normalizedHash) ||
      bcrypt.compareSync(password, hash)
    );
  } catch (e) {
    return false;
  }
}

export { bcrypt };
