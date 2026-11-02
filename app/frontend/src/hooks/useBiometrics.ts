import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export function useBiometrics() {
  const [isSupported, setIsSupported] = useState(Platform.OS !== 'web');

  const authenticate = useCallback(async (promptMessage: string = 'Authenticate'): Promise<BiometricAuthResult> => {
    if (Platform.OS === 'web') {
      return { success: true };
    }
    // Future integration with expo-local-authentication
    return { success: true };
  }, []);

  return {
    isSupported,
    authenticate,
  };
}
