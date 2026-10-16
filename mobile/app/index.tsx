import { Redirect } from "expo-router";

import { useAuthStore } from "@/store/useAuthStore";

export default function IndexScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return <Redirect href={accessToken ? "/home" : "/sign-in"} />;
}
