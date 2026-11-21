import { HomeView } from "@/components/HomeView";
import { findUser } from "@/lib/users";

// Read on every request: the page shows a row from the database.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeView firstUser={await findUser(1)} />;
}
