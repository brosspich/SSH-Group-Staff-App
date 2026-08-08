import AsyncStorage from "@react-native-async-storage/async-storage";

export const EXCHANGE_RATE_KEY = "currency_exchange_rate";
export const EXCHANGE_MODE_KEY = "currency_exchange_mode";
export const DEFAULT_RATE = "4000";

/**
 * Fetches the USD to KHR exchange rate from the National Bank of Cambodia website.
 */
export async function fetchNBCExchangeRate(): Promise<string> {
  // Try fetching from official NBC website
  try {
    const response = await fetch(
      "https://www.nbc.gov.kh/english/economic_research/exchange_rate.php",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );
    if (response.ok) {
      const html = await response.text();
      const match = html.match(
        /Official Exchange Rate\s*:\s*<font[^>]*>(\d+)<\/font>\s*KHR\s*\/\s*USD/i,
      );
      if (match && match[1]) {
        console.log(
          "ExchangeRate: Successfully parsed official NBC rate:",
          match[1],
        );
        return match[1];
      }
    }
  } catch (error) {
    console.warn(
      "ExchangeRate: Failed to fetch from official NBC website. Trying fallback API...",
      error,
    );
  }

  // Fallback to open exchange rates API (supports CORS, reliable on Web and Native)
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (response.ok) {
      const data = (await response.json()) as any;
      if (data && data.result === "success" && data.rates && data.rates.KHR) {
        const rate = Math.round(data.rates.KHR).toString();
        console.log(
          "ExchangeRate: Successfully fetched rate from fallback API:",
          rate,
        );
        return rate;
      }
    }
  } catch (fallbackError) {
    console.warn("ExchangeRate: Fallback API fetch failed:", fallbackError);
  }

  throw new Error("Unable to retrieve exchange rate from NBC or fallback API");
}

/**
 * Updates the stored exchange rate in background if exchange mode is set to 'auto'.
 */
export async function updateExchangeRateFromNBC(): Promise<string | null> {
  try {
    const mode = await AsyncStorage.getItem(EXCHANGE_MODE_KEY);
    if (mode === "auto" || mode === null) {
      const rate = await fetchNBCExchangeRate();
      await AsyncStorage.setItem(EXCHANGE_RATE_KEY, rate);
      if (mode === null) {
        await AsyncStorage.setItem(EXCHANGE_MODE_KEY, "auto");
      }
      return rate;
    }
  } catch (error) {
    console.warn(
      "ExchangeRate: Failed to update background exchange rate:",
      error,
    );
  }
  return null;
}
