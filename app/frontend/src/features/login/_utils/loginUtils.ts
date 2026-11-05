/**
 * Validates login input fields before network dispatch (Frontend 30% UI validation)
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
