import { LandingPage } from "@/app/(landing-page)/components/landing-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <LandingPage />;
}
