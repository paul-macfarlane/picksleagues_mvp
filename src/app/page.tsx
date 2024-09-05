import { auth } from "@/auth";
import SignIn from "@/components/sign-in";
import { SignOut } from "@/components/signout-button";

export default async function Home() {
  const session = await auth();

  return (
    <main>
      <h1>Hello Pix</h1>

      {!!session?.user && <SignOut />}

      {!session?.user && <SignIn />}
    </main>
  );
}
