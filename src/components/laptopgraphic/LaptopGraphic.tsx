import { StyleSheet, Text, View } from "react-native";

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
              <View style={graphicStyles.appLogoText} />
            </View>
            <View style={graphicStyles.userAvatar}>
              <Text style={graphicStyles.userAvatarText}>LP</Text>
            </View>
          </View>

          {/* Main Dashboard Layout: Sidebar + Content */}
          <View style={graphicStyles.screenBody}>
            {/* Sidebar */}
            <View style={graphicStyles.sidebar}>
              {/* Active menu item: DashBoard */}
              <View style={graphicStyles.sidebarActiveItem}>
                <View style={graphicStyles.activeIconDot} />
                <View style={graphicStyles.activeItemText} />
              </View>
              {/* Other menu items */}
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>
              <View style={graphicStyles.sidebarItem}>
                <View style={graphicStyles.itemIconDot} />
                <View style={graphicStyles.itemText} />
              </View>
            </View>

            {/* Main Content Area */}
            <View style={graphicStyles.mainContent}>
              {/* Header Title */}
              <View style={graphicStyles.dashboardHeader}>
                <View style={graphicStyles.headerTitleLine} />
                <View style={graphicStyles.headerSubtitleLine} />
              </View>

              {/* Filter Pills */}
              <View style={graphicStyles.filterPillsRow}>
                <View style={graphicStyles.activePill} />
                <View style={graphicStyles.inactivePill} />
                <View style={graphicStyles.inactivePill} />
                <View style={graphicStyles.inactivePill} />
                <View style={graphicStyles.inactivePill} />
              </View>

              {/* Stat Cards Grid (4 mini cards matching screenshot: Revenue, Spend, Cash, KHQR) */}
              <View style={graphicStyles.statCardsRow}>
                <View
                  style={[graphicStyles.statCard, { borderColor: "#dcfce7" }]}
                >
                  <View
                    style={[
                      graphicStyles.statDot,
                      { backgroundColor: "#16a34a" },
                    ]}
                  />
                  <View style={graphicStyles.statLine1} />
                  <View style={graphicStyles.statLine2} />
                </View>
                <View
                  style={[graphicStyles.statCard, { borderColor: "#ffedd5" }]}
                >
                  <View
                    style={[
                      graphicStyles.statDot,
                      { backgroundColor: "#ea580c" },
                    ]}
                  />
                  <View style={graphicStyles.statLine1} />
                  <View style={graphicStyles.statLine2} />
                </View>
                <View
                  style={[graphicStyles.statCard, { borderColor: "#f3e8ff" }]}
                >
                  <View
                    style={[
                      graphicStyles.statDot,
                      { backgroundColor: "#9333ea" },
                    ]}
                  />
                  <View style={graphicStyles.statLine1} />
                  <View style={graphicStyles.statLine2} />
                </View>
                <View
                  style={[graphicStyles.statCard, { borderColor: "#fce7f3" }]}
                >
                  <View
                    style={[
                      graphicStyles.statDot,
                      { backgroundColor: "#db2777" },
                    ]}
                  />
                  <View style={graphicStyles.statLine1} />
                  <View style={graphicStyles.statLine2} />
                </View>
              </View>

              {/* Revenue & Orders Chart Area */}
              <View style={graphicStyles.chartCard}>
                <View style={graphicStyles.chartHeaderRow}>
                  <View style={graphicStyles.chartTitleLine} />
                  <View style={graphicStyles.currencyBadge} />
                </View>
                <View style={graphicStyles.chartBarsContainer}>
                  <View style={graphicStyles.chartYAxis}>
                    <View style={graphicStyles.yLine} />
                    <View style={graphicStyles.yLine} />
                    <View style={graphicStyles.yLine} />
                  </View>
                  <View style={graphicStyles.barsRow}>
                    <View style={[graphicStyles.bar, { height: 14 }]} />
                    <View style={[graphicStyles.bar, { height: 25 }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Laptop Hinge / Notch & Base */}
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
    marginVertical: 16,
  },
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
  topBar: {
    height: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  appLogoSquare: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#1d4ed8",
  },
  appLogoText: {
    width: 18,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  userAvatar: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 5,
    color: "#ffffff",
    fontWeight: "700",
    includeFontPadding: false,
  },
  screenBody: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 44,
    backgroundColor: "#ffffff",
    borderRightWidth: 0.5,
    borderRightColor: "#e2e8f0",
    padding: 3,
    gap: 3,
  },
  sidebarActiveItem: {
    height: 11,
    backgroundColor: "#1d4ed8",
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    gap: 3,
  },
  activeIconDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  activeItemText: {
    width: 22,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#ffffff",
  },
  sidebarItem: {
    height: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    gap: 3,
  },
  itemIconDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#94a3b8",
  },
  itemText: {
    width: 20,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#cbd5e1",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 4,
    gap: 3,
  },
  dashboardHeader: {
    gap: 1.5,
  },
  headerTitleLine: {
    width: 34,
    height: 3.5,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  headerSubtitleLine: {
    width: 52,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#94a3b8",
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  activePill: {
    width: 12,
    height: 5,
    borderRadius: 2,
    backgroundColor: "#1d4ed8",
  },
  inactivePill: {
    width: 10,
    height: 5,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  statCardsRow: {
    flexDirection: "row",
    gap: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    padding: 2,
    borderWidth: 0.5,
    gap: 1.5,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  statLine1: {
    width: "75%",
    height: 2,
    borderRadius: 1,
    backgroundColor: "#94a3b8",
  },
  statLine2: {
    width: "100%",
    height: 3,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  chartCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    padding: 3,
    justifyContent: "space-between",
  },
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartTitleLine: {
    width: 24,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: "#0f172a",
  },
  currencyBadge: {
    width: 10,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#1d4ed8",
  },
  chartBarsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 26,
  },
  chartYAxis: {
    width: 12,
    height: "100%",
    justifyContent: "space-between",
  },
  yLine: {
    width: 10,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginLeft: 2,
  },
  bar: {
    width: 7,
    backgroundColor: "#1d4ed8",
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },
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
