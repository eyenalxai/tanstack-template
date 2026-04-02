import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getFormErrorMessage } from "@/lib/form/error-message"
import { orpc } from "@/lib/orpc/client"
import { getOrpcErrorMessage } from "@/lib/orpc/error-message"
import { createStuffSchema } from "@/server/stuff/stuff.schemas"

const UploadStuffPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      description: "",
    },
    validators: {
      onChange: createStuffSchema,
    },
    onSubmit: ({ value }) => {
      setSubmitError(null)
      createStuffMutation.mutate(value)
    },
  })

  const createStuffMutation = useMutation(
    orpc.stuff.create.mutationOptions({
      onError: (error) => {
        setSubmitError(getOrpcErrorMessage(error, "Could not save stuff. Please try again."))
      },
      onSuccess: async () => {
        form.reset()
        await queryClient.invalidateQueries({
          queryKey: orpc.stuff.key({ type: "query" }),
        })
        await navigate({ to: "/stuff" })
      },
    }),
  )

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Stuff</CardTitle>
          <CardDescription>Add a new entry that will appear in the public feed.</CardDescription>
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
            <form.Field name="description">
              {(field) => {
                const fieldError = field.state.meta.errors[0]
                const fieldErrorMessage = getFormErrorMessage(fieldError)

                return (
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm" htmlFor={field.name}>
                      Description
                    </label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Write some stuff..."
                      rows={5}
                      value={field.state.value}
                    />
                    {fieldErrorMessage ? (
                      <p className="text-destructive-foreground text-xs">{fieldErrorMessage}</p>
                    ) : null}
                  </div>
                )
              }}
            </form.Field>

            {submitError ? (
              <p className="text-destructive-foreground text-sm">{submitError}</p>
            ) : null}

            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button
                  disabled={canSubmit !== true || createStuffMutation.isPending === true}
                  type="submit"
                >
                  {createStuffMutation.isPending ? "Saving..." : "Save Stuff"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
        <CardFooter>
          <Link className="text-sm underline underline-offset-4" to="/stuff">
            Back to public feed
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}

export const Route = createFileRoute("/_protected/upload")({
  component: UploadStuffPage,
})
