import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import React from "react"

import { cn } from "~components/utils"

const buttonVariants = cva(
  "ce-inline-flex ce-items-center ce-justify-center ce-whitespace-nowrap ce-rounded ce-transition-colors focus-visible:ce-outline-none focus-visible:ce-shadow-none disabled:ce-pointer-events-none disabled:ce-opacity-50 dark:focus-visible:ce-ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "ce-bg-primary ce-text-white hover:ce-bg-primary/90 dark:hover:ce-bg-primary/90",
        destructive: "ce-text-red-500 ce-bg-red-100 ce-border-none",
        outline:
          "ce-border ce-border-border ce-shadow-sm hover:ce-bg-gray-100 ce-shadow-none",
        secondary:
          "ce-bg-grayAlpha-100 hover:ce-bg-grayAlpha-200 ce-border-none",
        ghost: "dark:focus-visible:ce-ring-0 hover:ce-bg-grayAlpha-100",
        link: "dark:focus-visible:ce-ring-0"
      },
      size: {
        default: "ce-h-7 ce-rounded ce-px-2 ce-py-1",
        sm: "ce-h-6 ce-rounded ce-px-2 ce-py-2",
        xs: "ce-h-5 ce-rounded ce-px-1 ce-py-1",
        lg: "ce-h-8 ce-px-4 ce-py-2",
        xl: "ce-h-9 ce-rounded ce-px-8 ce-text-base",
        "2xl": "ce-h-12 ce-rounded ce-px-8",
        icon: "ce-h-9 ce-w-9"
      },
      full: {
        false: "ce-w-auto",
        true: "ce-w-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      full: false
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
  isActive?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      full,
      asChild = false,
      children,
      isLoading,
      isActive,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, full, className }),
          isActive && "!ce-bg-accent !ce-text-accent-foreground"
        )}
        ref={ref}
        type="button"
        {...props}
        disabled={isLoading ?? disabled}>
        {isLoading ? (
          <LoaderCircle className="ce-mr-2 ce-animate-spin" />
        ) : (
          <></>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
