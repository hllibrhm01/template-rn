import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The axios instance already times out at 30s. With the library default
      // of 3 retries a single unreachable/slow request would keep a screen in
      // its loading state for ~2 minutes. One bounded retry settles quickly so
      // the UI can render content or an empty/error state instead of hanging.
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      // Most data (cars, expenses, catalog) changes infrequently; a 2-minute
      // freshness window cuts redundant refetches on navigation/remount.
      // Real-time screens (e.g. chat) override this with their own staleTime.
      staleTime: 2 * 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});
