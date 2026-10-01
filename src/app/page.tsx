import { getSessionUser } from "@/lib/auth";
import { SplashScreen } from "./splash-client";

export default async function HomePage() {
  const user = await getSessionUser();
  return <SplashScreen isAdmin={user?.role === "admin"} />;
}
