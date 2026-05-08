# Tire2Go Setup Guide

This project is a `Next.js` application that uses `npm`, `Prisma`, and a `PostgreSQL` database.

Repository URL:

```bash
https://github.com/kylemastercoder14/Tire2Go.git
```

Default branch:

```bash
main
```

## 1. Clone the repository

If you do not have the project yet, run:

```bash
git clone https://github.com/kylemastercoder14/Tire2Go.git
cd Tire2Go
```

If you already cloned it before, update it with:

```bash
git pull origin main
```

## 2. Install Node.js dependencies

Install all project modules using `npm`:

```bash
npm install
```

This project includes a `postinstall` script that automatically runs:

```bash
prisma generate
```

## 3. Create and configure the environment file

Copy `.env.example` into `.env`:

```bash
copy .env.example .env
```

Then fill in the required values inside `.env`.

Current environment variables:

```env
# DATABASE
DATABASE_URL=

# AWS S3
NEXT_PUBLIC_S3_ACCESS_KEY_ID=
NEXT_PUBLIC_S3_SECRET_ACCESS_KEY=
NEXT_PUBLIC_S3_BUCKET_NAME=

# CLERK AUTH
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# NODEMAILER CONFIGURATION
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=

# GEMINI KEY
GOOGLE_API_KEY=

# GROQ KEY
GROQ_API_KEY=
```

## 4. Configure the database

This project uses Prisma with a PostgreSQL datasource, so `DATABASE_URL` must point to a valid PostgreSQL database.

Example:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tire2go"
```

Format:

```env
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

## 5. Generate Prisma client

If needed, run Prisma client generation manually:

```bash
npx prisma generate
```

## 6. Push the Prisma schema to the database

This repository currently uses `prisma/schema.prisma` and does not include a migrations folder, so for first-time setup use:

```bash
npx prisma db push
```

This will sync your Prisma schema with the connected PostgreSQL database.

## 7. Run the development server

Start the app with:

```bash
npm run dev
```

Then open:

```bash
http://localhost:3000
```

## 8. Production commands

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## 9. Default credentials

Use these credentials for testing or initial access.

Admin:

```text
Email: tire2go01@gmail.com
Password: Tyre2go123@
```

Owner:

```text
Email: tire2goc1@gmail.com
Password: Tyr32go@123
```

## 10. Recommended setup flow

For a complete first-time setup:

```bash
git clone https://github.com/kylemastercoder14/Tire2Go.git
cd Tire2Go
npm install
copy .env.example .env
```

Then update `.env` and run:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

## 11. Recommended update flow

If the project already exists locally:

```bash
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## 12. Common issues

- `DATABASE_URL` is empty or invalid: Prisma commands will fail until it is set correctly.
- PostgreSQL is not running: `prisma db push` will fail if the database server is offline.
- Missing API keys: some app features may not work until the required `.env` values are filled in.
