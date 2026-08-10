import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { StaffUser } from "@/services/userService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StaffPickerModalProps {
  visible: boolean;
  staffList: StaffUser[];
  selectedStaffId: string | null;
  onClose: () => void;
  onSelect: (staffId: string) => void;
}

export function StaffPickerModal({
  visible,
  staffList,
  selectedStaffId,
  onClose,
  onSelect,
}: StaffPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const filteredStaff = staffList.filter((st) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.id && st.id.toLowerCase().includes(q)) ||
      (st.position && st.position.toLowerCase().includes(q)) ||
      (st.username && st.username.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.backdrop}>
        <TouchableOpacity
          style={s.backdropDismiss}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>Select Staff Member</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <MaterialIcons
                name="close"
                size={22}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color={AppColors.grey} />
            <TextInput
              style={s.searchInput}
              placeholder="Search staff name, ID, or position..."
              placeholderTextColor={AppColors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={AppColors.grey}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Staff List */}
          <ScrollView
            style={s.scrollList}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredStaff.length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons
                  name="people-outline"
                  size={36}
                  color={AppColors.grey}
                />
                <Text style={s.emptyText}>No staff members found</Text>
              </View>
            ) : (
              filteredStaff.map((item) => {
                const isSelected = item.id === selectedStaffId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.staffCard, isSelected && s.staffCardSelected]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                  >
                    <View
                      style={[s.avatarBg, isSelected && s.avatarBgSelected]}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color={
                          isSelected ? AppColors.background2 : AppColors.primary
                        }
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[s.staffName, isSelected && s.staffNameSelected]}
                      >
                        {item.name}
                      </Text>
                      <Text style={s.staffSub}>
                        ID: {item.id} • {item.position || "Staff Member"}
                      </Text>
                    </View>

                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={AppColors.secondary}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={AppColors.grey}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: `${AppColors.grey}33`,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  closeBtn: { padding: 4 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  scrollList: {
    maxHeight: 380,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 12,
  },

  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: AppColors.background2,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  staffCardSelected: {
    borderColor: AppColors.secondary,
    backgroundColor: `${AppColors.secondary}0D`,
  },
  avatarBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${AppColors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBgSelected: {
    backgroundColor: AppColors.secondary,
  },
  staffName: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  staffNameSelected: {
    color: AppColors.secondary,
  },
  staffSub: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },

  emptyBox: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: AppColors.grey,
    marginTop: 8,
    fontFamily: AppFonts.regular,
  },
});
