import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

// Custom Dropdown for Month/Year Selection
function CustomMonthYearDropdown({ value, onChange, options, className }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const selectedItemRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1 rounded-lg border border-secondary-grey100 bg-white px-2 font-inter font-medium text-[14px] leading-[20px] text-secondary-grey400 hover:bg-gray-50"
      >
        {selectedOption?.label}
        <img
          src="/calender-arrow-down.svg"
          alt="dropdown"
          className={cn("size-2 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-[10000] mt-1 w-[63px] max-h-[80px] overflow-auto scrollbar-hide rounded-lg bg-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
          style={{
            border: "0.5px solid var(--secondary-grey100, #D6D6D6)",
            padding: "4px",
          }}
        >
          <div className="flex flex-col gap-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                ref={option.value === value ? selectedItemRef : null}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-[55px] h-[24px] flex items-center justify-between rounded-sm py-1 px-1.5 font-inter font-normal text-[12px] leading-[16px] text-secondary-grey400 hover:bg-secondary-grey50",
                  option.value === value && "bg-blue-primary100"
                )}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <img
                    src="/calender-tick.svg"
                    alt="selected"
                    className="w-2 h-2"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit ", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-lg border border-secondary-grey100",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-secondary-grey400",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 select-none rounded-md font-inter font-normal text-[12px] leading-[16px] text-[#64748B]",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-secondary-grey200 aria-selected:text-secondary-grey200",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <img
                src="/calender-arrow-left.svg"
                alt="Previous"
                className={cn("size-3", className)}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <img
                src="/calender-arrow-right.svg"
                alt="Next"
                className={cn("size-3", className)}
                {...props}
              />
            );
          }

          return (
            <img
              src="/calender-arrow-down.svg"
              alt="Next"
              className={cn("size-2", className)}
              {...props}
            />
          );
        },
        Dropdown: ({ value, onChange, children, ...props }) => {
          const options = React.Children.toArray(children).map((child) => ({
            value: child.props.value,
            label: child.props.children,
          }));

          return (
            <CustomMonthYearDropdown
              value={value}
              onChange={(e) => onChange?.({ target: { value: e } })}
              options={options}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "focus:outline-none focus:ring-0 data-[selected-single=true]:bg-blue-primary250 data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-blue-primary250 data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-blue-primary250 data-[range-end=true]:text-primary-foreground flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-inter font-normal text-[14px] leading-[20px] data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md [&>span]:text-xs [&>span]:opacity-70",
        !modifiers.outside && "text-secondary-grey400",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
