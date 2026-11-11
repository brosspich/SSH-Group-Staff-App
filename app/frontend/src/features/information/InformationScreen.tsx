import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { renderLogoutModal } from "@/shared/components/logout/logoutModal";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { EditFieldModal } from "./_components/EditFieldModal";
import { InformationCard } from "./_components/InformationCard";
import { useInformation } from "./_hooks/useInformation";

export default function InformationScreen() {
  const { t } = useLanguage();
  const { isMobile } = useResponsive();

  const {
    user,
    loading,
    refreshing,
    onRefresh,
    editingField,
    setEditingField,
    logoutModalVisible,
    setLogoutModalVisible,
    handleFieldSaved,
  } = useInformation();

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.centered}>
          <Loading />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <AppbarBack Title={t("account.title")} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.secondary}
            colors={[theme.colors.secondary]}
          />
        }
      >
        <View
          style={[
            { flex: 1, width: "100%" },
            !isMobile && { maxWidth: "60%", alignSelf: "center" },
          ]}
        >
          <InformationCard user={user} onEditField={setEditingField} />
        </View>
      </ScrollView>

      {renderLogoutModal({
        logoutModalVisible,
        setLogoutModalVisible,
        isMobile,
      })}

      <EditFieldModal
        key={editingField ?? "none"}
        visible={editingField !== null}
        fieldKey={editingField}
        onClose={() => setEditingField(null)}
        user={user}
        onSaved={handleFieldSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
