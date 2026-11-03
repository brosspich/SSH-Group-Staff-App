import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface DeviceOSIconProps {
  os: string;
  isLarge?: boolean;
  deviceType?: string;
}

export default function DeviceOSIcon({
  os,
  isLarge = false,
  deviceType,
}: DeviceOSIconProps) {
  const osLower = (os || "").toLowerCase();
  const circleSize = isLarge ? 72 : 44;
  const iconSize = isLarge ? 36 : 22;

  let bg = "#0088cc";
  let iconName = "web";
  let IconComponent: any = MaterialCommunityIcons;

  if (deviceType === "web" || osLower.includes("web")) {
    bg = "#0088cc";
    iconName = "web";
    IconComponent = MaterialCommunityIcons;
  } else if (
    osLower.includes("android") ||
    osLower.includes("harmony") ||
    osLower.includes("huawei") ||
    osLower.includes("hios") ||
    osLower.includes("hyperos") ||
    osLower.includes("one ui") ||
    osLower.includes("coloros") ||
    osLower.includes("oxygenos") ||
    osLower.includes("emui") ||
    osLower.includes("magicos")
  ) {
    bg = "#5cbf47";
    iconName = "android";
    IconComponent = FontAwesome6;
  } else if (
    osLower.includes("ios") ||
    osLower.includes("mac") ||
    osLower.includes("apple") ||
    osLower.includes("iphone") ||
    osLower.includes("ipad") ||
    osLower.includes("ipod") ||
    osLower.includes("macos")
  ) {
    bg = "#29b6f6";
    iconName = "apple";
    IconComponent = FontAwesome6;
  } else if (osLower.includes("windows")) {
    bg = "#0288d1";
    iconName = "windows";
    IconComponent = FontAwesome6;
  }

  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: circleSize,
          height: circleSize,
          backgroundColor: bg,
          marginRight: isLarge ? 0 : 14,
        },
      ]}
    >
      <IconComponent name={iconName} size={iconSize} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
