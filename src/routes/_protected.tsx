import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { getSession } from "@/server/auth/session.functions"

const ProtectedLayout = () => {
  return <Outlet />
}

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      // oxlint-disable-next-line typescript/only-throw-error: Correct pattern for Tanstack Start
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      })
    }

    return { user: session.user }
  },
  component: ProtectedLayout,
})
