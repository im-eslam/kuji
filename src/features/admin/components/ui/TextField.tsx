import type { ReactNode, Ref } from "react";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
} from "react-aria-components";
import { cx } from "./classes";

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password";
  autoComplete?: string;
  maxLength?: number;
  isReadOnly?: boolean;
  // Usernames, codes: no auto-capitalize, auto-correct or spellcheck.
  isIdentifier?: boolean;
  dir?: "ltr" | "rtl" | "auto";
  inputRef?: Ref<HTMLInputElement>;
  // Sits inside the field at the end edge (e.g. a show/hide button).
  endSlot?: ReactNode;
  description?: string;
}

const styles = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold",
  control:
    "text-body min-h-12 w-full rounded-lg border border-navy/15 bg-white px-4 outline-none data-focused:border-navy data-focused:ring-1 data-focused:ring-navy data-invalid:border-error",
  controlWithEnd: "pe-12",
  wrap: "relative",
  end: "absolute end-0 top-0",
  description: "text-caption text-navy/65",
  error: "text-caption font-bold text-error",
};

export function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  maxLength,
  isReadOnly,
  isIdentifier,
  dir,
  inputRef,
  endSlot,
  description,
}: TextFieldProps) {
  return (
    <AriaTextField
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      isReadOnly={isReadOnly}
      className={styles.field}
    >
      <Label className={styles.label}>{label}</Label>
      <div className={styles.wrap} dir={dir}>
        <Input
          ref={inputRef}
          autoComplete={autoComplete}
          maxLength={maxLength}
          dir={dir}
          autoCapitalize={isIdentifier ? "none" : undefined}
          autoCorrect={isIdentifier ? "off" : undefined}
          spellCheck={isIdentifier ? false : undefined}
          className={cx(
            styles.control,
            Boolean(endSlot) && styles.controlWithEnd,
          )}
        />
        {endSlot && <div className={styles.end}>{endSlot}</div>}
      </div>
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      <FieldError className={styles.error} />
    </AriaTextField>
  );
}
