import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getFormErrorMessage } from "@/lib/form/error-message"
import { createStuffSchema } from "@/server/stuff/stuff.schemas"

type EditStuffDialogProps = {
  open: boolean
  initialDescription: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (description: string) => void
}

export const EditStuffDialog = ({
  open,
  initialDescription,
  isPending,
  onOpenChange,
  onSubmit,
}: EditStuffDialogProps) => {
  const initialTrimmedDescription = initialDescription.trim()
  const form = useForm({
    defaultValues: {
      description: initialDescription,
    },
    validators: {
      onChange: createStuffSchema,
    },
    onSubmit: ({ value }) => {
      const trimmedDescription = value.description.trim()

      if (
        !createStuffSchema.safeParse(value).success ||
        trimmedDescription === initialTrimmedDescription
      ) {
        return
      }

      onSubmit(trimmedDescription)
    },
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Stuff</DialogTitle>
          <DialogDescription>Update the description for your entry.</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (isPending) {
                return
              }
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

            <DialogFooter variant="bare">
              <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">{isPending ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogPanel>
      </DialogContent>
    </Dialog>
  )
}
