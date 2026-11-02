import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  networkType: Network.NetworkStateType;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    networkType: Network.NetworkStateType.UNKNOWN,
  });

  useEffect(() => {
    let isMounted = true;

    async function checkNetwork() {
      try {
        const netState = await Network.getNetworkStateAsync();
        if (isMounted) {
          setStatus({
            isConnected: !!netState.isConnected,
            isInternetReachable: !!netState.isInternetReachable,
            networkType: netState.type ?? Network.NetworkStateType.UNKNOWN,
          });
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    checkNetwork();
    const interval = setInterval(checkNetwork, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}
