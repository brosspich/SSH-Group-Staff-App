import AppbarBack from "@/components/appbar/appbarback";
import Copyright from "@/components/copyright/copyright";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AppImages } from "@/constants/appImages";
import { useResponsive } from "@/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function About() {
  const { isMobile } = useResponsive();

  const coreValues = [
    {
      icon: "bulb-outline",
      title: "Innovation",
      desc: "A continuous commitment to improving product offerings to meet the evolving needs of clients.",
      color: "#eab308",
    },
    {
      icon: "ribbon-outline",
      title: "Quality",
      desc: "A dedication to providing durable, reliable products that meet the highest industry standards.",
      color: "#3b82f6",
    },
    {
      icon: "people-outline",
      title: "Customer-Centricity",
      desc: "Placing customers at the heart of our operations by providing exceptional service.",
      color: "#ec4899",
    },
    {
      icon: "leaf-outline",
      title: "Sustainability",
      desc: "A dedication to reducing environmental impact through sustainable business practices.",
      color: "#22c55e",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Integrity",
      desc: "Operating with transparency, honesty, and fairness in all interactions.",
      color: "#8b5cf6",
    },
    {
      icon: "flash-outline",
      title: "Efficiency",
      desc: "Providing solutions that maximize operational efficiency and streamline workflows.",
      color: "#f97316",
    },
  ];

  return (
    <>
      {/* <SafeAreaView
        edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
        style={{ flex: 1, backgroundColor: AppColors.background2 }}
      > */}
      <AppbarBack Title="About us" />
      <View style={styles.contanar}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo and Brand Section */}
          <View style={styles.conLogo}>
            <Image source={AppImages.logoSSH} style={styles.logo} />
            <Text style={{ color: AppColors.secondary }}>|</Text>
            <Image source={AppImages.logoStaffW} style={styles.logo} />
          </View>

          {/* Description Card */}
          <View style={styles.card}>
            <Text style={styles.txt}>
              At SSH GROUP, we specialize in providing high-quality plastic
              products and barcode solutions to help businesses streamline their
              operations. With a diverse range of offerings, including Plastic
              Pallets, Wood Pallets, Basket Pallets, various types of shrink
              films (POF, PE, PVC), and top-of-the-line Barcode Printers and
              Scanners, we’re committed to meeting the needs of industries in
              Cambodia. Whether you're looking for durable packaging solutions
              or advanced labeling technology, we are your trusted partner in
              ensuring your products are delivered efficiently and securely.
            </Text>
          </View>

          {/* Mission & Vision Section */}
          <View style={isMobile ? styles.rowMobile : styles.rowTablet}>
            {/* Mission Card */}
            <View style={[styles.card, !isMobile && styles.cardHalf]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${AppColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="rocket-outline"
                    size={24}
                    color={AppColors.secondary}
                  />
                </View>
                <Text style={styles.title}>Mission</Text>
              </View>
              <Text style={styles.cardTxt}>
                Our mission is to provide businesses with innovative, reliable,
                and cost-effective plastic products and barcode solutions that
                improve logistics, packaging, and inventory management. We aim
                to be a key enabler of efficiency and productivity for our
                clients by offering high-quality products and outstanding
                customer service, ensuring businesses can operate seamlessly and
                effectively.
              </Text>
            </View>

            {/* Vision Card */}
            <View style={[styles.card, !isMobile && styles.cardHalf]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${AppColors.secondary}15` },
                  ]}
                >
                  <Ionicons
                    name="eye-outline"
                    size={24}
                    color={AppColors.secondary}
                  />
                </View>
                <Text style={styles.title}>Vision</Text>
              </View>
              <Text style={styles.cardTxt}>
                Our vision is to become a leading provider of high-quality
                plastic products and barcode solutions in the global market. We
                aim to continuously innovate and expand our product offerings,
                enabling our customers to maximize operational efficiency and
                stay ahead of industry trends. We strive to be recognized for
                our commitment to excellence, reliability, and sustainable
                business practices.
              </Text>
            </View>
          </View>

          {/* Core Values Card */}
          <View style={styles.card}>
            <View style={[styles.cardHeader, { marginBottom: 16 }]}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: `${AppColors.secondary}15`,
                    borderRadius: 12,
                  },
                ]}
              >
                <Ionicons
                  name="star-outline"
                  size={24}
                  color={AppColors.secondary}
                />
              </View>
              <Text style={styles.title}>Core Values</Text>
            </View>

            <View style={styles.valuesGrid}>
              {coreValues.map((val, index) => (
                <View key={index} style={styles.valueRow}>
                  <View
                    style={[
                      styles.valueIconContainer,
                      { backgroundColor: `${val.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={val.icon as any}
                      size={20}
                      color={val.color}
                    />
                  </View>
                  <View style={styles.valueTextContainer}>
                    <Text style={styles.valueTitle}>{val.title}</Text>
                    <Text style={styles.valueDesc}>{val.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Copyright />

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
      {/* </SafeAreaView> */}
    </>
  );
}

const styles = StyleSheet.create({
  contanar: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: 16,
  },
  conLogo: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 10,
    gap: 10,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    // padding: 10,
    // backgroundColor: AppColors.background2,
    borderRadius: 10,
    borderColor: AppColors.secondary,
    borderWidth: 1.5,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 18,
    color: AppColors.primary,
  },
  txt: {
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    // textAlign: "justify",
    lineHeight: 24,
    color: AppColors.textPrimary,
  },
  cardTxt: {
    fontSize: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    // textAlign: "justify",
    lineHeight: 22,
    color: AppColors.textSecondary,
  },
  rowMobile: {
    flexDirection: "column",
  },
  rowTablet: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  cardHalf: {
    flex: 1,
    marginBottom: 0,
  },
  valuesGrid: {
    gap: 16,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  valueIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 15,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  valueDesc: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
});
