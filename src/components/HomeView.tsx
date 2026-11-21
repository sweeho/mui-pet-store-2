import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { DATABASE_NAME } from "@/constants/database";
import { greeting } from "@/lib/format";
import type { User } from "@/lib/users";

/** The home page's content: the greeting and one row read from the database. */
export function HomeView({ firstUser }: { firstUser: User | null }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h1">{greeting("world")}</Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Running on {DATABASE_NAME}.
          </Typography>
          <Typography variant="h5" data-testid="first-user" sx={{ mt: 1 }}>
            {firstUser ? `First user: ${firstUser.name}` : "No users yet"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
