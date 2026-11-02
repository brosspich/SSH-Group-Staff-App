import * as Device from "expo-device";
import { Platform, useWindowDimensions } from "react-native";

export type DeviceType = "mobile" | "tablet" | "desktop";

const isWeb = Platform.OS === "web";
// const deviceType = isWeb ? null : Device.deviceType;
// const isRealTablet = deviceType === Device.DeviceType.TABLET;
// const isRealDesktop = deviceType === Device.DeviceType.DESKTOP;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const deviceType = isWeb ? null : Device.deviceType;
  const isRealTablet = deviceType === Device.DeviceType.TABLET;
  const isRealDesktop = deviceType === Device.DeviceType.DESKTOP;

  const TABLET_MIN_WIDTH = 600;
  const DESKTOP_MIN_WIDTH = 1024;

  const isTablet = isWeb
    ? width >= TABLET_MIN_WIDTH && width < DESKTOP_MIN_WIDTH
    : (isRealTablet || width >= TABLET_MIN_WIDTH) && width < DESKTOP_MIN_WIDTH;

  const isDesktop = isWeb
    ? width >= DESKTOP_MIN_WIDTH
    : isRealDesktop || width >= DESKTOP_MIN_WIDTH;

  // const isTablet = isWeb
  //   ? width >= 600 && width < 1024
  //   : isRealTablet && width >= 600;
  // const isDesktop = isWeb ? width >= 1024 : isRealDesktop || width >= 1024;
  const isLandscape = width > height;

  // console.log(
  //   "width:",
  //   width,
  //   "isTablet:",
  //   isTablet,
  //   "deviceType:",
  //   Device.deviceType,
  // );

  const device: DeviceType = isDesktop
    ? "desktop"
    : isTablet
      ? "tablet"
      : "mobile";

  const scale = (size: number) => Math.round((width / 375) * size);

  const isMobile = !isTablet && !isDesktop;

  function pick<T>(mobile: T, tablet: T, desktop?: T): T {
    if (isDesktop && desktop !== undefined) return desktop;
    if (isTablet) return tablet;
    return mobile;
  }

  const numColumns = (mobileN: number, tabletN: number, desktopN?: number) =>
    pick(mobileN, tabletN, desktopN);

  const spacing = {
    xs: pick(4, 6, 8),
    sm: pick(8, 10, 12),
    md: pick(12, 16, 20),
    lg: pick(16, 24, 32),
    xl: pick(24, 32, 40),
    horizontal: pick(12, 20, 32),
  };

  const fontSize = {
    xs: pick(10, 11, 12),
    sm: pick(12, 13, 14),
    md: pick(14, 15, 16),
    lg: pick(16, 18, 20),
    xl: pick(20, 24, 28),
    xxl: pick(26, 32, 38),
  };

  const sidebarWidth = isTablet ? 200 : 0;
  const cardWidth = (columns: number, gap: number) =>
    (width - sidebarWidth - spacing.horizontal * 2 - gap * (columns - 1)) /
    columns;

  return {
    width,
    height,
    isTablet,
    isDesktop,
    isMobile,
    isLandscape,
    device,
    scale,
    pick,
    numColumns,
    spacing,
    fontSize,
    cardWidth,
  };
}
