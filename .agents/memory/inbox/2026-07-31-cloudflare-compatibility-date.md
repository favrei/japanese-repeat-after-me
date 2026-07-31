# Cloudflare local runtime compatibility date

- A live `npm run dev` check failed when the Worker compatibility date was set
  to 2026-07-31.
- The Cloudflare runtime bundled with the current Vite plugin supports dates
  through 2026-05-22, even though the newer Vitest runtime supports later
  dates.
- Production/local Vite and Worker tests should therefore share 2026-05-22
  until the Vite plugin/runtime is upgraded.
