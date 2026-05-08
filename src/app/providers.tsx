'use client'

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { useState } from 'react'

function isUnauthorized(error: unknown) {
  return (
    (error as { status?: number })?.status === 401 ||
    (error as Error)?.message?.includes('JWT')
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (isUnauthorized(error)) {
              window.location.href = '/login'
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (isUnauthorized(error)) {
              window.location.href = '/login'
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
