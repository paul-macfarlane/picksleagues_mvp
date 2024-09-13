import { auth } from "@clerk/nextjs/server";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default async function Navbar() {
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

          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href={"/sign-in"}>Sign in</Link>
          </SignedOut>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
