import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { auth, signIn, signOut } from "@/auth";
import Button from "@mui/material/Button";
import ProfileMenu from "./profile-menu";

export default async function Navbar() {
  const session = await auth();

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <Link
            color="inherit"
            underline={"none"}
            href={"/"}
            component={NextLink}
          >
            <Typography variant="h6" component="div">
              PicksLeagues
            </Typography>
          </Link>

          <div style={{ flexGrow: 1 }}></div>

          {session?.user ? (
            <ProfileMenu user={session.user} />
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn(undefined, {
                  redirectTo: "/api/post-auth",
                });
              }}
            >
              <Button type="submit">Sign in</Button>
            </form>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
