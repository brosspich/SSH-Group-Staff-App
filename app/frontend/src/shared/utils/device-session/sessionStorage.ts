import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "device_session_id";

/**
 * Retrieves the persisted device session ID or generates a unique one if not present.
 */
export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id || id.startsWith("session_")) {
    return "";
  }
  return id;
}

/**
 * Clears the stored device session ID.
 */
export async function clearSessionId(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * Sets a specific session ID into local storage.
 */
export async function setSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, id);
}
