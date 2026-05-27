"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheck, Info, TriangleAlert, OctagonX, Loader2 } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4" strokeWidth={1.5} />,
        info: <Info className="size-4" strokeWidth={1.5} />,
        warning: <TriangleAlert className="size-4" strokeWidth={1.5} />,
        error: <OctagonX className="size-4" strokeWidth={1.5} />,
        loading: <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />,
      }}
      style={
        {
          "--normal-bg": "var(--elevated)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--elevated)",
          "--success-text": "var(--success)",
          "--error-bg": "var(--elevated)",
          "--error-text": "var(--destructive)",
          "--warning-bg": "var(--elevated)",
          "--warning-text": "var(--warning)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
