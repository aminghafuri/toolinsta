"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const classString = typeof className === 'string' ? className : ''
  const isGrid = classString.includes('grid')

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        isGrid
          ? "grid w-full border-2 border-border rounded-lg p-1 gap-1 items-stretch"
          : "inline-flex h-10 items-center justify-start gap-1 border-2 border-border rounded-lg p-1",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "text-muted-foreground hover:text-foreground",
      "data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-black/5 dark:data-[state=active]:ring-white/10 dark:data-[state=active]:border dark:data-[state=active]:border-white/10",
      "min-w-0",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    <div className="animate-drawer-open">
      {children}
    </div>
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
