import { AppColors } from "@/constants/appcolors";
import { StyleSheet, View } from "react-native";

const LaptopGraphic = () => {
  return (
    <View style={graphicStyles.container}>
      <View style={graphicStyles.screenBorder}>
        {/* Webcam dot */}
        <View style={graphicStyles.cameraDot} />

        {/* Screen inner content */}
        <View style={graphicStyles.screenInner}>
          {/* Top Bar */}
          <View style={graphicStyles.topBar}>
            <View style={graphicStyles.topBarLeft}>
              <View style={graphicStyles.appLogoSquare} />
              <View style={graphicStyles.appLogoDivider} />
              <View style={graphicStyles.appLogoSquare} />
            </View>
            <View style={graphicStyles.userAvatar} />
          </View>

          {/* Screen Body (Sidebar + Content) */}
          <View style={graphicStyles.screenBody}>
            {/* Sidebar */}
            <View style={graphicStyles.sidebar}>
              {/* Home (Active) */}
              <View style={graphicStyles.sidebarActiveItem}>
                <View style={graphicStyles.activeIconDot} />
                <View style={graphicStyles.activeItemText} />
              </View>

              {/* Attendance */}
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>

              {/* Report */}
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>

              {/* Setting */}
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>
            </View>

            {/* Main Content Area */}
            <View style={graphicStyles.mainContent}>
              {/* Welcome Banner Card */}
              <View style={graphicStyles.bannerCard}>
                <View style={graphicStyles.bannerLeft}>
                  <View style={graphicStyles.greetingLine} />
                  <View style={graphicStyles.userNameLine} />
                  <View style={graphicStyles.badgeRow}>
                    <View style={graphicStyles.miniBadge} />
                    <View style={graphicStyles.miniBadge} />
                  </View>
                </View>
                <View style={graphicStyles.bannerRight}>
                  <View style={graphicStyles.clockTimeLine} />
                  <View style={graphicStyles.clockDateLine} />
                  <View style={graphicStyles.shiftBadge}>
                    <View style={graphicStyles.shiftDot} />
                    <View style={graphicStyles.shiftLine} />
                  </View>
                </View>
              </View>

              {/* 3 Summary Cards */}
              <View style={graphicStyles.summaryRow}>
                {/* Time-In */}
                <View style={graphicStyles.summaryCard}>
                  <View
                    style={[
                      graphicStyles.summaryIconBox,
                      { backgroundColor: "#dcfce7" },
                    ]}
                  >
                    <View
                      style={[
                        graphicStyles.summaryIconDot,
                        { backgroundColor: "#15803d" },
                      ]}
                    />
                  </View>
                  <View style={graphicStyles.summaryTextCol}>
                    <View
                      style={[
                        graphicStyles.summaryLabelLine,
                        { backgroundColor: "#15803d" },
                      ]}
                    />
                    <View
                      style={[
                        graphicStyles.summaryValueLine,
                        { backgroundColor: "#15803d" },
                      ]}
                    />
                  </View>
                </View>

                {/* Time-Out */}
                <View style={graphicStyles.summaryCard}>
                  <View
                    style={[
                      graphicStyles.summaryIconBox,
                      { backgroundColor: "#dbeafe" },
                    ]}
                  >
                    <View
                      style={[
                        graphicStyles.summaryIconDot,
                        { backgroundColor: "#1d4ed8" },
                      ]}
                    />
                  </View>
                  <View style={graphicStyles.summaryTextCol}>
                    <View
                      style={[
                        graphicStyles.summaryLabelLine,
                        { backgroundColor: "#1d4ed8" },
                      ]}
                    />
                    <View
                      style={[
                        graphicStyles.summaryValueLine,
                        { backgroundColor: "#94a3b8" },
                      ]}
                    />
                  </View>
                </View>

                {/* Time-Other */}
                <View style={graphicStyles.summaryCard}>
                  <View
                    style={[
                      graphicStyles.summaryIconBox,
                      { backgroundColor: "#f3e8ff" },
                    ]}
                  >
                    <View
                      style={[
                        graphicStyles.summaryIconDot,
                        { backgroundColor: "#7e22ce" },
                      ]}
                    />
                  </View>
                  <View style={graphicStyles.summaryTextCol}>
                    <View
                      style={[
                        graphicStyles.summaryLabelLine,
                        { backgroundColor: "#7e22ce" },
                      ]}
                    />
                    <View
                      style={[
                        graphicStyles.summaryValueLine,
                        { backgroundColor: "#7e22ce" },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Scan Attendance Button */}
              <View style={graphicStyles.scanBtn}>
                <View style={graphicStyles.scanIconCircle} />
                <View style={graphicStyles.scanTextCol}>
                  <View style={graphicStyles.scanTitleLine} />
                  <View style={graphicStyles.scanSubLine} />
                </View>
                <View style={graphicStyles.scanChevron} />
              </View>

              {/* Recent Logs Section Header */}
              <View style={graphicStyles.logsHeader}>
                <View style={graphicStyles.logsTitleLine} />
                <View style={graphicStyles.logsLinkLine} />
              </View>

              {/* Recent Log Rows */}
              <View style={graphicStyles.logList}>
                {/* Row 1 */}
                <View style={graphicStyles.logRow}>
                  <View
                    style={[
                      graphicStyles.logBadge,
                      { backgroundColor: "#f3e8ff" },
                    ]}
                  />
                  <View style={graphicStyles.logCenter}>
                    <View style={graphicStyles.logTimeLine} />
                    <View style={graphicStyles.logDateLine} />
                  </View>
                  <View style={graphicStyles.logRight}>
                    <View style={graphicStyles.logNameLine} />
                    <View style={graphicStyles.logIdLine} />
                  </View>
                </View>

                {/* Row 2 */}
                <View style={graphicStyles.logRow}>
                  <View
                    style={[
                      graphicStyles.logBadge,
                      { backgroundColor: "#f3e8ff" },
                    ]}
                  />
                  <View style={graphicStyles.logCenter}>
                    <View style={graphicStyles.logTimeLine} />
                    <View style={graphicStyles.logDateLine} />
                  </View>
                  <View style={graphicStyles.logRight}>
                    <View style={graphicStyles.logNameLine} />
                    <View style={graphicStyles.logIdLine} />
                  </View>
                </View>

                {/* Row 3 */}
                <View style={graphicStyles.logRow}>
                  <View
                    style={[
                      graphicStyles.logBadge,
                      { backgroundColor: "#dcfce7" },
                    ]}
                  />
                  <View style={graphicStyles.logCenter}>
                    <View style={graphicStyles.logTimeLine} />
                    <View style={graphicStyles.logDateLine} />
                  </View>
                  <View style={graphicStyles.logRight}>
                    <View style={graphicStyles.logNameLine} />
                    <View style={graphicStyles.logIdLine} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Laptop Hinge / Notch & Base (exact original size) */}
      <View style={graphicStyles.baseNotch} />
      <View style={graphicStyles.base} />
      <View style={graphicStyles.baseBottom} />
    </View>
  );
};

export default LaptopGraphic;

const graphicStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
  },
  // Exact original screen dimensions (width 200, height 125)
  screenBorder: {
    width: 200,
    height: 125,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingTop: 3,
    paddingHorizontal: 4,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: "#475569",
    alignItems: "center",
  },
  cameraDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#475569",
    marginBottom: 2,
  },
  screenInner: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    overflow: "hidden",
  },

  // Top Bar
  topBar: {
    height: 13,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  appLogoSquare: {
    width: 6,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: AppColors.secondary,
  },
  appLogoDivider: {
    width: 1,
    height: 6,
    backgroundColor: AppColors.secondary,
  },
  userAvatar: {
    width: 8,
    height: 8,
    borderRadius: 2.5,
    backgroundColor: AppColors.secondary,
  },

  // Screen Body
  screenBody: {
    flex: 1,
    flexDirection: "row",
  },

  // Sidebar
  sidebar: {
    width: 40,
    backgroundColor: "#ffffff",
    borderRightWidth: 0.5,
    borderRightColor: "#e2e8f0",
    padding: 3,
    gap: 2,
  },
  sidebarActiveItem: {
    height: 10,
    backgroundColor: AppColors.secondary,
    borderRadius: 2.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    gap: 2.5,
  },
  activeIconDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  activeItemText: {
    width: 18,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  sidebarItem: {
    height: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    gap: 2.5,
  },
  itemIconDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: AppColors.secondary,
  },
  itemText: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: `${AppColors.secondary}66`,
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 3,
    gap: 2.5,
  },

  // Welcome Banner Card
  bannerCard: {
    backgroundColor: AppColors.secondary,
    borderRadius: 3,
    padding: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerLeft: {
    gap: 1.5,
  },
  greetingLine: {
    width: 20,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  userNameLine: {
    width: 32,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 2,
  },
  miniBadge: {
    width: 12,
    height: 3,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  bannerRight: {
    alignItems: "flex-end",
    gap: 1.5,
  },
  clockTimeLine: {
    width: 26,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  clockDateLine: {
    width: 22,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1.5,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 2.5,
    paddingVertical: 1,
    borderRadius: 1.5,
  },
  shiftDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#22c55e",
  },
  shiftLine: {
    width: 22,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },

  // 3 Summary Cards
  summaryRow: {
    flexDirection: "row",
    gap: 2,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 2.5,
    padding: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  summaryIconBox: {
    width: 6,
    height: 6,
    borderRadius: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1,
  },
  summaryTextCol: {
    flex: 1,
    gap: 1,
  },
  summaryLabelLine: {
    width: "70%",
    height: 1.5,
    borderRadius: 1,
  },
  summaryValueLine: {
    width: "100%",
    height: 2.5,
    borderRadius: 1,
  },

  // Scan Button
  scanBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 2.5,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 2.5,
  },
  scanIconCircle: {
    width: 6,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  scanTextCol: {
    flex: 1,
    gap: 1,
  },
  scanTitleLine: {
    width: "65%",
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  scanSubLine: {
    width: "45%",
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  scanChevron: {
    width: 2,
    height: 3,
    borderRadius: 0.5,
    backgroundColor: "#ffffff",
  },

  // Logs Section Header
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logsTitleLine: {
    width: 36,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  logsLinkLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: AppColors.secondary,
  },

  // Log List
  logList: {
    gap: 1.5,
  },
  logRow: {
    backgroundColor: "#ffffff",
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  logBadge: {
    width: 16,
    height: 4,
    borderRadius: 1,
  },
  logCenter: {
    flex: 1,
    marginLeft: 3,
    gap: 1,
  },
  logTimeLine: {
    width: 24,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  logDateLine: {
    width: 18,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "#94a3b8",
  },
  logRight: {
    alignItems: "flex-end",
    gap: 1,
  },
  logNameLine: {
    width: 28,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  logIdLine: {
    width: 14,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "#94a3b8",
  },

  // Exact original laptop base dimensions
  baseNotch: {
    width: 24,
    height: 2,
    backgroundColor: "#334155",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  base: {
    width: 224,
    height: 5,
    backgroundColor: "#94a3b8",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  baseBottom: {
    width: 244,
    height: 4,
    backgroundColor: "#64748b",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
