import * as TabsPrimitive from "@radix-ui/react-tabs"
import React from "react"

import { cn } from "./utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "ce-inline-flex ce-h-8 ce-items-center ce-justify-center ce-rounded-md ce-bg-grayAlpha-100 ce-p-1.5",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "ce-inline-flex ce-items-center ce-justify-center ce-whitespace-nowrap ce-rounded ce-px-3 ce-py-0.5 ce-ring-offset-background ce-transition-all focus-visible:ce-outline-none focus-visible:ce-ring-2 focus-visible:ce-ring-ring focus-visible:ce-ring-offset-2 disabled:ce-pointer-events-none disabled:ce-opacity-50 data-[state=active]:ce-bg-accent data-[state=active]:ce-text-accent-foreground",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ce-mt-2 ce-ring-offset-background focus-visible:ce-outline-none focus-visible:ce-ring-2 focus-visible:ce-ring-ring focus-visible:ce-ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
