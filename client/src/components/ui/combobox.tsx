import * as React from "react";
import { cn } from "@/lib/utils";

interface ComboboxProps<T> {
  value: string;
  onValueChange: (value: string) => void;
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
  loading?: boolean;
  renderNoOptions?: () => React.ReactNode;
}

export function Combobox<T>({
  value,
  onValueChange,
  options,
  getOptionLabel,
  getOptionValue,
  onSelect,
  placeholder = "Select...",
  className = "",
  loading = false,
  renderNoOptions,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setInputValue(e.target.value);
          onValueChange(e.target.value);
          setOpen(true);
        }}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={getOptionValue(option)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => {
                  onSelect(getOptionValue(option));
                  setOpen(false);
                }}
              >
                {getOptionLabel(option)}
              </div>
            ))
          ) : renderNoOptions ? (
            <div className="p-2">{renderNoOptions()}</div>
          ) : (
            <div className="p-4 text-center text-gray-500">No options</div>
          )}
        </div>
      )}
    </div>
  );
} 