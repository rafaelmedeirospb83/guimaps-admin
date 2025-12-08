import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 shadow-md hover:shadow-lg',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'border-2 border-primary text-primary hover:bg-primary-50',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(baseStyles, variantStyles[variant], fullWidth && 'w-full', className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

