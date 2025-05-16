import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '../../../server/appRouter';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  // 1. Prioritize VITE_API_BASE_URL if explicitly set (for Vercel/production client-side builds)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 2. Browser environment (local dev) - use relative path for Vite proxy
  if (typeof window !== 'undefined') return ''; 
  // 3. Vercel SSR (fallback if VITE_API_BASE_URL not set - less ideal, API should be separate)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; 
  // 4. Development SSR (e.g. local node server running client code, or if PORT is set for some reason)
  return `http://localhost:${process.env.PORT ?? 5001}`; // dev SSR should use localhost (adjusted port to likely 5001 for local Express)
}

export function getTRPCUrl() {
  return `${getBaseUrl()}/trpc`;
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getTRPCUrl(),
      // You can pass any HTTP headers you wish here
      async headers() {
        return {};
      },
    }),
  ],
});
