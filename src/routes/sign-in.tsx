import { useForm } from "@tanstack/react-form"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/auth-client"

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

const getSafeRedirect = (redirect: string | undefined, fallback: string) => {
  if (redirect === undefined || redirect === null || redirect === "") {
    return fallback
  }

  if (redirect.startsWith("/")) {
    return redirect
  }

  try {
    const url = new URL(redirect)
    const composedPath = `${url.pathname}${url.search}${url.hash}`
    return composedPath.startsWith("/") ? composedPath : fallback
  } catch {
    return fallback
  }
}

const SignInPage = () => {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })

      if (result.error) {
        setSubmitError(result.error.message ?? "Invalid email or password.")
        return
      }

      const redirectTo = getSafeRedirect(search.redirect, "/upload")
      if (redirectTo.startsWith("/")) {
        await navigate({ to: redirectTo })
      }
    },
  })

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Use your email and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) {
                    return "Email is required"
                  }
                  if (!value.includes("@")) {
                    return "Please provide a valid email address"
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-sm" htmlFor={field.name}>
                    Email
                  </label>
                  <Input
                    autoComplete="email"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-destructive-foreground text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value) {
                    return "Password is required"
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-sm" htmlFor={field.name}>
                    Password
                  </label>
                  <Input
                    autoComplete="current-password"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Your password"
                    type="password"
                    value={field.state.value}
                  />
                  {field.state.meta.errors[0] ? (
                    <p className="text-destructive-foreground text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            {submitError !== undefined && submitError !== null && submitError !== "" ? (
              <p className="text-destructive-foreground text-sm">{submitError}</p>
            ) : null}

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button disabled={canSubmit !== true || isSubmitting === true} type="submit">
                  {isSubmitting === true ? "Signing in..." : "Sign In"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm">
            No account yet?{" "}
            <Link className="underline underline-offset-4" to="/sign-up">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

export const Route = createFileRoute("/sign-in")({
  validateSearch: signInSearchSchema,
  component: SignInPage,
})
