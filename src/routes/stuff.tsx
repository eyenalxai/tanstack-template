import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"

import { EditStuffDialog } from "@/components/stuff/edit-stuff-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api, createApiUtils } from "@/lib/api"
import { getSession } from "@/server/auth/session.functions"

type StuffRow = NonNullable<ReturnType<typeof api.stuff.list.useQuery>["data"]>[number]

export const Route = createFileRoute("/stuff")({
  loader: async ({ context }) => {
    await createApiUtils(context.queryClient).stuff.list.ensureData()
    const session = await getSession()

    return {
      viewerUserId: session?.user.id ?? null,
    }
  },
  component: StuffPage,
})

function StuffPage() {
  const { viewerUserId } = Route.useLoaderData()
  const utils = api.useUtils()
  const { data: stuffRows } = api.stuff.list.useQuery()
  const [editingStuff, setEditingStuff] = useState<StuffRow | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const updateStuffMutation = api.stuff.update.useMutation({
    onMutate: async (input) => {
      const mutationInput = input as { uuid: string; description: string }
      setEditError(null)
      const previousStuffList = utils.stuff.list.getData()

      utils.stuff.list.setData((current) =>
        current?.map((row) =>
          row.uuid === mutationInput.uuid
            ? { ...row, description: mutationInput.description }
            : row,
        ),
      )

      return {
        previousStuffList,
      }
    },
    onError: (_error, _input, context) => {
      utils.stuff.list.setData(() => context?.previousStuffList)
      setEditError("Could not update stuff. Please try again.")
    },
    onSuccess: () => {
      setEditingStuff(null)
      setEditError(null)
    },
    onSettled: async () => {
      await utils.stuff.list.invalidate()
    },
  })

  const openEditDialog = (stuff: StuffRow) => {
    setEditingStuff(stuff)
    setEditError(null)
  }

  const closeEditDialog = () => {
    if (updateStuffMutation.isPending) {
      return
    }

    setEditingStuff(null)
    setEditError(null)
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>All Stuff</CardTitle>
          <CardDescription>
            Public feed of all entries, newest first.{" "}
            <Link className="underline underline-offset-4" to="/upload">
              Add your own
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stuffRows === undefined ? (
            <p className="text-muted-foreground text-sm">Loading stuff...</p>
          ) : stuffRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No stuff yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stuffRows.map((stuff) => (
                  <TableRow key={stuff.uuid}>
                    <TableCell className="max-w-[24rem] whitespace-normal">
                      {stuff.description}
                    </TableCell>
                    <TableCell>{stuff.user?.name ?? stuff.user?.email ?? "Unknown"}</TableCell>
                    <TableCell>{formatDate(stuff.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {viewerUserId !== undefined &&
                      viewerUserId !== null &&
                      viewerUserId !== "" &&
                      stuff.userId === viewerUserId ? (
                        <Button onClick={() => openEditDialog(stuff)} size="sm" variant="outline">
                          Edit
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingStuff ? (
        <EditStuffDialog
          key={editingStuff.uuid}
          errorMessage={editError}
          initialDescription={editingStuff.description}
          isPending={updateStuffMutation.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeEditDialog()
            }
          }}
          onSubmit={(description) =>
            updateStuffMutation.mutate({
              uuid: editingStuff.uuid,
              description,
            })
          }
          open={editingStuff !== null}
        />
      ) : null}
    </main>
  )
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
