import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

type Toast = {
  id: string
  message: string
  type: ToastType
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]))
}

export function showToast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).substring(7)
  toasts.push({ id, message, type })
  notify()

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, 5000)
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts)
    }
    toastListeners.push(listener)
    setCurrentToasts([...toasts])

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[toast.type]

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg min-w-[300px] animate-in slide-in-from-right`}
    >
      {toast.message}
    </div>
  )
}

