import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/lib/roles";
import { LandingPage } from "@/components/landing-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getAuthenticatedUser();

  if (user) {
    if (user.mustChangePassword) {
      redirect("/primeiro-acesso");
    }
    redirect(getDefaultRouteForRole(user.role));
  }

  return <LandingPage />;
}
