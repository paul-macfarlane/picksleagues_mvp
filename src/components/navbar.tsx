import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { auth, signIn } from "@/auth";
import Button from "@mui/material/Button";
import ProfileMenu from "./profile-menu";

export default async function Navbar() {
  const session = await auth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pix
          </Typography>

          {!!session?.user ? (
            <ProfileMenu user={session.user} />
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn();
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
