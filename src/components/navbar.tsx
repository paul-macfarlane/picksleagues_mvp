import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { auth, signIn } from "@/auth";
import Button from "@mui/material/Button";
import ProfileMenu from "./profile-menu";
import { Link } from "@mui/material";
import NextLink from "next/link";

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
              Pix
            </Typography>
          </Link>

          <div style={{ flexGrow: 1 }}></div>

          {!!session?.user ? (
            <ProfileMenu user={session.user} />
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn(undefined, { redirectTo: "/api/post-signin" });
              }}
            >
              <Button type="submit" variant="text">
                Sign in
              </Button>
            </form>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
