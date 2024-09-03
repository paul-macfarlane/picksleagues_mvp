# Pix

Pix is an application where friends can compete to see who is the best sports prognosticator by joining leagues where they make picks for sporting events for winners, against the spread, and/or over/under. The league member with the best record wins. To start off, Pix will be limited to NFL games, but may expand to College Football in the future.

## Architecture

In an ideal world, the application can be hosted for free. This is not a money making app (yet), so free or very low cost architecture is important.

### Next Serverless

- Application: NextJS hosted on Vercel
- Database: libSQL (SQLite fork) hosted using Turso
- CI:/CD: Vercel + GitHub handles application deployment
- Auth: NextAuth
- Other:
  - MUI as a component library
  - Drizzle as an ORM
  - Vercel Cron Functions for crons

## Local Setup

This app is built using Next.js, and Turso. To run lcoally

1. [Install Turso CLI](https://docs.turso.tech/cli/introduction)
2. Create a local db file using `turso dev --db-file local.db` (keep the process running)
3. Install dependencies by running `npm install`
4. Run `npm run dev` to run locally
