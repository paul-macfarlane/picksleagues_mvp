import { auth } from "@/auth";
import SignIn from "@/components/sign-in";
import { SignOut } from "@/components/signout-button";
import { db } from "@/db/client";
import { countries } from "@/db/schema";

export default async function Home() {
  const session = await auth();
  const countryList = await db.select().from(countries);

  return (
    <main>
      <h1>Hello Pix</h1>

      {countryList.length > 0 && (
        <ul>
          {countryList.map((country) => (
            <li key={country.id}>{country.name}</li>
          ))}
        </ul>
      )}

      {!!session?.user && <SignOut />}

      {!session?.user && <SignIn />}
    </main>
  );
}
