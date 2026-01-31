import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

const RadioGroupCards = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroupCards.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupCardItem = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[rgba(35,114,236,0.5)] hover:shadow-md data-[state=checked]:border-[rgba(35,114,236,1)] data-[state=checked]:bg-blue-50/50 data-[state=checked]:shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">{children}</div>
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-data-[state=checked]:border-[rgba(35,114,236,1)] group-data-[state=checked]:bg-white">
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[rgba(35,114,236,1)]" />
            </RadioGroupPrimitive.Indicator>
          </div>
        </div>
      </RadioGroupPrimitive.Item>
    );
  }
);
RadioGroupCardItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroupCards, RadioGroupCardItem };
