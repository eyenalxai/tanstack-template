import { useForm } from "@tanstack/react-form"

import { DescriptionField } from "@/components/stuff/description-field"
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
import { createStuffSchema } from "@/lib/stuff/forms"

interface EditStuffDialogProps {
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
              {(field) => (
                <DescriptionField
                  error={field.state.meta.errors[0]}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(v) => {
                    field.handleChange(v)
                  }}
                  value={field.state.value}
                />
              )}
            </form.Field>

            <DialogFooter variant="bare">
              <Button
                onClick={() => {
                  onOpenChange(false)
                }}
                type="button"
                variant="outline"
              >
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
