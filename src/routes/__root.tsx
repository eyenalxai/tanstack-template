/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router"

import { Providers } from "@/components/providers"

import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {children}
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}
