/**
 * Pure helper validation functions (Email, Passwords, SSH Keys)
 */

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  if (!password) return false;
  return password.length >= 6;
}

export function isValidSshPublicKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  const validPrefixes = ['ssh-rsa', 'ssh-ed25519', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521'];
  return validPrefixes.some((prefix) => trimmed.startsWith(prefix));
}
