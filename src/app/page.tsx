import { db } from "@/db/client";
import { countries } from "@/db/schema";

export default async function Home() {
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
    </main>
  );
}
