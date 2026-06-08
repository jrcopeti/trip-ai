"use client";
import { useEffect, useState } from "react";
import { useToggle } from "@/hooks/useToggle";
import { Popover } from "@heroui/react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { formatDate } from "@/lib/utils";

interface DatePickerProps {
  label?: string;
  id?: string;
  placeholder?: string;
  onChange?: (val?: string) => void;
  value?: string;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function DatePicker({ placeholder, onChange, value, ref }: DatePickerProps) {
    const [open, actions] = useToggle();
    const [date, setDate] = useState<string>();

    useEffect(() => {
      typeof value !== "undefined" && setDate(value);
    }, [value]);

    return (
      <Popover isOpen={open} onOpenChange={actions.setVisible}>
        <Popover.Trigger>
          <button
            ref={ref}
            type="button"
            className="flex max-w-lg w-full items-center gap-2 rounded-md border border-shark-300 bg-white px-3 py-3 text-left text-sm text-tuna-700 hover:border-neptune-400 focus:outline-none focus:ring-2 focus:ring-neptune-400"
          >
            <MdOutlineCalendarToday size="16px" className="shrink-0 text-tuna-500" />
            <span className={`flex-1 truncate ${date ? "text-tuna-700" : "text-shark-400"}`}>
              {date ? formatDate(date, false) : placeholder}
            </span>
            {date && (
              <FaXmark
                size="14px"
                className="shrink-0 cursor-pointer text-shark-400 hover:text-tuna-700"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDate("");
                  onChange?.(undefined);
                }}
              />
            )}
          </button>
        </Popover.Trigger>
        <Popover.Content placement="bottom" className="w-auto p-0">
          <Popover.Dialog>
            <DayPicker
              classNames={{
                caption: "text-shark-800",
                head: "text-shark-800",
                day: "w-10 h-8 rounded-full cursor-pointer hover:bg-yellow-300",
              }}
              modifiersStyles={{
                selected: { backgroundColor: "#447176", color: "#f8f8f8" },
              }}
              mode="single"
              selected={date ? dayjs(date).toDate() : undefined}
              onSelect={(_val) => {
                const formattedDate = dayjs(_val).toISOString();
                setDate(formattedDate);
                onChange?.(formattedDate);
                actions.onHidden();
              }}
              autoFocus
            />
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    );
}

export default DatePicker;
