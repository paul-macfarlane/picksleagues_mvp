# Picks Leagues

## MVP Note

This was a Next.js MVP of PicksLeagues, an application where friends compete to see who is the best football prognosticator. This was just an MVP, for the latest versions of Picks Leagues, see https://github.com/paul-macfarlane/picksleagues-web and https://github.com/paul-macfarlane/picksleagues-api.

## Description

Picks Leagues is an application where friends can compete to see who is the best sports prognosticator by joining
leagues where they make picks for sporting events against the spread or straight up winners. The most accurate picker
wins.

## Architecture

In an ideal world, the application can be hosted for free. This is not a money making app (yet), so free or very low
cost architecture is important.

### Next Serverless

- Application: NextJS hosted on Vercel
- Database: libSQL (SQLite fork) hosted using Turso
- CI:/CD: Vercel + GitHub handles application deployment
- Auth: NextAuth (AuthJS Beta)
- Other:
    - TailwindCSS
    - Shad CN for component generation
    - React Hook Forms
    - Drizzle ORM
    - https://cron-job.org/en/ for cron jobs

## Local Setup

This app is built using Next.js, and Turso. To run lcoally

1. Copy `.env.local.example` to `.env.local`. Replace the values of the env vars. Reach out
   to [paul-macfarlane](https://github.com/paul-macfarlane).
2. [Install Turso CLI](https://docs.turso.tech/cli/introduction)
3. Create a local db file using npm run db:local (keep the process running)
4. Install dependencies by running `npm install --force`
5. Run `npm run db:generate && npm run db:migrate` to run database migrations
6. Run `npm run dev` and go to http://localhost:3000/auth to sign in with your gmail or discord.
7. Run `npm run db:seed` which will seed your local database with fake sport league data. Note that you will have to replace `picksleagues@gmail.com` with your email address for your user to become commisioner of the seeded picks leagues.
