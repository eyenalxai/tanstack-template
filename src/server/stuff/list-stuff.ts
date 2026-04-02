import type { Transaction } from "@/lib/database/client"

export const listStuffs = (tx: Transaction) => {
  return tx.query.stuffs.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}
