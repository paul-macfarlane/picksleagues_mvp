# Pix

Pix is an application where friends can put their sports knowledge to the test an compete to see who is the best sports prognosticator. Friends can join leagues where they make picks for sporting events for winners, against the spread, and/or over/under. The league member with the best record wins. To start off, Pix will be limited to NFL games, but may expand to College Football in the future.

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
