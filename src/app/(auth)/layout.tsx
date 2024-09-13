import Stack from "@mui/material/Stack";
import { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <main>
        <Stack
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {children}
        </Stack>
      </main>
    </>
  );
}
