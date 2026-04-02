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
import { signUpCredentialsSchema } from "@/lib/form/auth-schemas"
import { getFormErrorMessage } from "@/lib/form/error-message"
import { authRedirectSearchSchema, getSafeRedirect } from "@/lib/navigation/safe-redirect"

const deriveNameFromEmail = (email: string) => {
  const [localPart] = email.split("@")
  const trimmed = localPart?.trim()
  return trimmed !== undefined && trimmed !== null && trimmed.length > 0 ? trimmed : "user"
}

const SignUpPage = () => {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signUpCredentialsSchema,
    },
    onSubmit: async ({ value }) => {
      const derivedName = deriveNameFromEmail(value.email)
      const result = await authClient.signUp.email({
        email: value.email,
        name: derivedName,
        password: value.password,
      })

      if (result.error) {
        toastManager.add({
          type: "error",
          title: "Sign up failed",
          description: result.error.message ?? "Could not create account.",
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
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account with email and password.</CardDescription>
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
                      onChange={(event) => field.handleChange(event.target.value)}
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
                      autoComplete="new-password"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="At least 8 characters"
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
                <Button type="submit">
                  {isSubmitting === true ? "Creating account..." : "Sign Up"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm">
            Already have an account?{" "}
            <Link className="underline underline-offset-4" to="/sign-in">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

export const Route = createFileRoute("/sign-up")({
  validateSearch: authRedirectSearchSchema,
  component: SignUpPage,
})
