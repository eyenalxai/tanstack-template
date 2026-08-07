import { useForm } from "@tanstack/react-form"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"

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
import { toastManager } from "@/components/ui/toast"
import { authClient } from "@/lib/auth/auth-client"
import { signInCredentialsSchema } from "@/lib/auth/forms"
import { authRedirectSearchSchema, getSafeRedirect } from "@/lib/auth/redirect"
import { getFormErrorMessage } from "@/lib/form-errors"

const SignInPage = () => {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInCredentialsSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })

      if (result.error) {
        toastManager.add({
          type: "error",
          title: "Sign in failed",
          description: result.error.message ?? "Invalid email or password.",
          priority: "high",
        })
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
              if (form.state.isSubmitting) {
                return
              }
              void form.handleSubmit()
            }}
          >
            <form.Field name="email">
              {(field) => {
                const fieldError = getFormErrorMessage(field.state.meta.errors[0])

                return (
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm" htmlFor={field.name}>
                      Email
                    </label>
                    <Input
                      autoComplete="email"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                      }}
                      placeholder="you@example.com"
                      type="email"
                      value={field.state.value}
                    />
                    {fieldError ? (
                      <p className="text-destructive-foreground text-xs">{fieldError}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const fieldError = getFormErrorMessage(field.state.meta.errors[0])

                return (
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm" htmlFor={field.name}>
                      Password
                    </label>
                    <Input
                      autoComplete="current-password"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                      }}
                      placeholder="Your password"
                      type="password"
                      value={field.state.value}
                    />
                    {fieldError ? (
                      <p className="text-destructive-foreground text-xs">{fieldError}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit">{isSubmitting ? "Signing in..." : "Sign In"}</Button>
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
  validateSearch: authRedirectSearchSchema,
  component: SignInPage,
})
