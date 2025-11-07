import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-colored-lg hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border-2 border-primary bg-background shadow-sm hover:bg-primary/5 hover:border-primary-dark hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:shadow-secondary hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground active:bg-accent",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark",
        gradient:
          "bg-gradient-primary text-white shadow-md hover:shadow-colored-lg hover:scale-[1.02] active:scale-[0.98]",
        gradientSecondary:
          "bg-gradient-secondary text-white shadow-md hover:shadow-secondary hover:scale-[1.02] active:scale-[0.98]",
        gradientAccent:
          "bg-gradient-accent text-white shadow-md hover:shadow-accent hover:scale-[1.02] active:scale-[0.98]",
        glass:
          "glass shadow-soft hover:shadow-soft-lg backdrop-blur-md border border-white/30 hover:border-white/50",
        modern:
          "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg hover:shadow-colored-lg hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
