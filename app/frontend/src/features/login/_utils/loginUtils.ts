import bcrypt from "bcryptjs";

/**
 * Validates login input fields before network dispatch
 */
export function validateLoginInput(
  username: string,
  password: string,
): string | null {
  if (!username.trim() || !password.trim()) {
    return "Please enter username and password.";
  }
  return null;
}

/**
 * Verifies if user entered password matches stored password or bcrypt hash
 */
export async function verifyUserPassword(
  inputPassword: string,
  storedPassword?: string | null,
): Promise<boolean> {
  if (!storedPassword) return false;
  const rawStored = storedPassword.trim();
  const rawInput = inputPassword.trim();

  // 1. Plaintext match (exact or trimmed)
  if (rawStored === inputPassword || rawStored === rawInput) {
    return true;
  }

  // 2. Bcrypt hash match
  if (rawStored.startsWith("$2")) {
    const normalizedHash = rawStored.replace(/^\$2y\$/, "$2a$");

    // Fast sync compare
    try {
      if (
        bcrypt.compareSync(rawInput, normalizedHash) ||
        bcrypt.compareSync(inputPassword, normalizedHash) ||
        bcrypt.compareSync(rawInput, rawStored) ||
        bcrypt.compareSync(inputPassword, rawStored)
      ) {
        return true;
      }
    } catch {}

    // Async fallback compare
    try {
      const resClean = await bcrypt.compare(rawInput, normalizedHash);
      const resRaw = await bcrypt.compare(inputPassword, normalizedHash);
      return Boolean(resClean || resRaw);
    } catch {}
  }

  return false;
}
