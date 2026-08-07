import { Textarea } from "@/components/ui/textarea"
import { getFormErrorMessage } from "@/lib/form-errors"

interface DescriptionFieldProps {
  id: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  error: unknown
}

export const DescriptionField = ({ id, value, onBlur, onChange, error }: DescriptionFieldProps) => {
  const errorMessage = getFormErrorMessage(error)

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm" htmlFor={id}>
        Description
      </label>
      <Textarea
        id={id}
        name={id}
        onBlur={onBlur}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder="Write some stuff..."
        rows={5}
        value={value}
      />
      {errorMessage ? <p className="text-destructive-foreground text-xs">{errorMessage}</p> : null}
    </div>
  )
}
