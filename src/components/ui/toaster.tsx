"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={500}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} variant="success" className="backdrop-blur-sm">
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle className="text-sm font-semibold text-white">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs text-white/90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="opacity-70 hover:opacity-100 transition-opacity text-white hover:text-white/80" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
