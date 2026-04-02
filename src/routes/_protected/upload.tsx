import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"

import { DescriptionField } from "@/components/stuff/description-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toastManager } from "@/components/ui/toast"
import { orpc } from "@/lib/orpc/client"
import { getOrpcErrorMessage } from "@/lib/rpc-errors"
import { createStuffSchema } from "@/lib/stuff/forms"

const UploadStuffPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      description: "",
    },
    validators: {
      onChange: createStuffSchema,
    },
    onSubmit: ({ value }) => {
      if (createStuffMutation.isPending) {
        return
      }

      createStuffMutation.mutate(value)
    },
  })

  const createStuffMutation = useMutation(
    orpc.stuff.create.mutationOptions({
      onError: (error) => {
        toastManager.add({
          type: "error",
          title: "Save failed",
          description: getOrpcErrorMessage(error, "Could not save stuff. Please try again."),
          priority: "high",
        })
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
              if (createStuffMutation.isPending) {
                return
              }
              void form.handleSubmit()
            }}
          >
            <form.Field name="description">
              {(field) => (
                <DescriptionField
                  error={field.state.meta.errors[0]}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(v) => field.handleChange(v)}
                  value={field.state.value}
                />
              )}
            </form.Field>

            <Button type="submit">
              {createStuffMutation.isPending ? "Saving..." : "Save Stuff"}
            </Button>
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
