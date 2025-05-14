import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[1rem] text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#9F7AEA] text-primary-foreground hover:bg-[#8A63D2] shadow-lg hover:shadow-[0_8px_30px_rgba(159,122,234,0.3)] hover:transform hover:translate-y-[-2px] hover:scale-[1.01]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-[rgba(31,31,31,0.7)] backdrop-blur-md border border-gray-800 text-primary hover:bg-[rgba(31,31,31,0.8)]",
        mood: "py-2 px-4 rounded-full bg-surface/80 text-secondary border border-transparent hover:border-[#9F7AEA]/30 hover:translate-y-[-1px]",
        moodActive: "py-2 px-4 rounded-full bg-[#9F7AEA] text-white border border-transparent hover:bg-[#8A63D2] hover:translate-y-[-1px]",
        mode: "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-transparent hover:border-[#9F7AEA]/30 hover:translate-y-[-1px]",
        modeActive: "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-[#9F7AEA]/10 border border-[#9F7AEA] hover:translate-y-[-1px]",
        tag: "py-1 px-3 rounded-full bg-surface/80 text-secondary border border-transparent hover:border-[#9F7AEA]/30",
        tagActive: "py-1 px-3 rounded-full bg-[#9F7AEA]/20 text-[#9F7AEA] border border-[#9F7AEA]/30",
        suggestion: "whitespace-nowrap py-2 px-4 rounded-full bg-surface/80 text-secondary border border-gray-800 hover:bg-surface",
        priority: "py-2 px-4 rounded-xl bg-surface/80 text-secondary border border-transparent",
        priorityActive: "py-2 px-4 rounded-xl bg-[#9F7AEA]/20 text-[#9F7AEA] border border-[#9F7AEA]/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        pill: "h-14 px-8 rounded-full",
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
