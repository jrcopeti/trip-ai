import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  InputProps,
} from "@nextui-org/react";
import dayjs from "dayjs";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";

import { forwardRef, useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn, formatDate } from "@/lib/utils";

import { useToggle } from "@/hooks/useToggle";

const DatePicker = forwardRef(
  (
    {
      placeholder,
      onChange,
      value,
      ...rest
    }: Omit<InputProps, "onChange"> & { onChange?: (val?: string) => void },
    ref,
  ) => {
    const [open, actions] = useToggle();
    const [date, setDate] = useState<string>();

    useEffect(() => {
      typeof value !== "undefined" && setDate(value);
    }, [value]);

    return (
      <Popover isOpen={open} onOpenChange={actions.setVisible}>
        <PopoverTrigger className="text-left">
          <Input
            {...rest}
            startContent={
              <div
                onClick={rest?.onClick}
                className="absolute z-10 flex flex-shrink-0 items-center gap-2"
              >
                <div>
                  <MdOutlineCalendarToday size="16px" />
                </div>{" "}
                {!date && (
                  <span className="w-full truncate text-left text-small font-normal text-foreground-500">
                    {placeholder}
                  </span>
                )}
              </div>
            }
            endContent={
              date && (
                <div className=" -translate-y-3 truncate text-left text-small font-normal text-foreground-500">
                  <FaXmark
                    size="14px"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e?.stopPropagation();
                      e?.preventDefault();
                      setDate("");
                      onChange?.(undefined);
                    }}
                  />
                </div>
              )
            }
            placeholder={placeholder}
            value={formatDate(date, false)}
            classNames={{
              input: cn("text-left ps-[30px!important] pt-5 z-20 h-full"),
              innerWrapper: "flex",
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <DayPicker
            mode="single"
            selected={dayjs(date).toDate()}
            onSelect={(_val) => {
              const _date = dayjs(_val).format("YYYY-MM-DD");
              const _formattedDate = new Date(_date).toISOString();
              setDate(_formattedDate);
              onChange?.(_formattedDate);
              actions.onHidden();
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
