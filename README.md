This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Code Review

Every pull request is reviewed automatically by five specialized Claude
review personas in parallel:

- **architecture** — separation of concerns, coupling, contracts
- **correctness** — logic bugs, edge cases, async ordering
- **security** — trust boundaries, injection, auth, secrets
- **performance** — algorithmic cost, render cost, memory, I/O
- **style** — naming, readability, idiom, codebase consistency

Each persona's scope is defined in `.github/review-personas/<persona>.md`,
with a shared baseline (project context, severity labels, output format)
in `.github/review-personas/_common.md`. Personas only flag issues
inside their lane, so the resulting reviews are focused and
non-redundant. Every comment is tagged with one of `[critical]`,
`[high]`, `[medium]`, `[low]`, or `[info]`, and each review ends with a
severity-count summary.

Adding a new persona is a one-file change: drop a new
`.github/review-personas/<name>.md` and add `<name>` to the matrix in
`.github/workflows/claude-review.yml`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
