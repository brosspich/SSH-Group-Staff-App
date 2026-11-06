import { theme } from "@/shared/styles/theme";
import Loading from "@/shared/components/loading/loading";
import { useUser } from "@/shared/contexts/UserContext";
import { Redirect } from "expo-router";
import { StatusBar, View } from "react-native";

export default function Index() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <>
        <StatusBar
          backgroundColor={theme.colors.secondary}
          barStyle="light-content"
        />
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loading />
        </View>
      </>
    );
  }

  if (!user) {
    return <Redirect href={"/login/login" as any} />;
  }

  return <Redirect href={"/(tabs)" as any} />;
}
