import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90",
        outline:
          "border border-border bg-transparent hover:bg-subtle/50",
        ghost:
          "hover:bg-subtle/50 hover:text-foreground",
        secondary:
          "bg-subtle text-foreground hover:bg-subtle/70",
        link:
          "text-accent underline-offset-4 hover:underline",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        xs: "h-7 px-2.5 text-xs rounded-md",
        lg: "h-12 px-5 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 rounded-md",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
