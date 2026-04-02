"use client"

import type { ThemeProviderProps } from "next-themes"

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { ToastProvider } from "@/components/ui/toast"

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props}>
      <ToastProvider>{children}</ToastProvider>
    </NextThemesProvider>
  )
}
