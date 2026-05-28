import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent-soft disabled:text-white",
        accent:
          "rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent-soft disabled:text-white",
        outline:
          "rounded-2xl border border-hairline bg-transparent text-foreground hover:bg-subtle",
        ghost:
          "rounded-md text-foreground hover:bg-subtle",
        secondary:
          "rounded-2xl bg-subtle text-foreground hover:bg-subtle/70",
        link:
          "text-accent underline-offset-4 hover:underline",
        destructive:
          "rounded-2xl bg-transparent text-destructive hover:bg-destructive/10",
        pill:
          "rounded-pill bg-subtle text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        "icon-circle":
          "rounded-full bg-accent text-accent-foreground hover:bg-accent/90",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        xs: "h-7 px-2.5 text-xs",
        lg: "h-14 px-5 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-9 w-9",
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
