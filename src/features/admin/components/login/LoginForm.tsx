import { useEffect, useRef, useState } from "react";
import { Form } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { LIMITS } from "../../config";
import { strings } from "../../localization/strings";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

interface LoginFormProps {
  isPending: boolean;
  isLocked: boolean;
  focusPassword: boolean;
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function LoginForm({
  isPending,
  isLocked,
  focusPassword,
  onSubmit,
}: LoginFormProps) {
  const s = useStrings(strings);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusPassword) passwordRef.current?.focus();
  }, [focusPassword]);

  const canSubmit = username.trim() !== "" && password !== "" && !isLocked;

  async function handleSubmit() {
    if (!canSubmit || isPending) return;
    await onSubmit(username.trim(), password);
    setPassword("");
  }

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <TextField
        label={s.usernameLabel}
        name="username"
        value={username}
        onChange={setUsername}
        autoComplete="username"
        maxLength={LIMITS.username}
        isReadOnly={isPending}
        isIdentifier
        dir="ltr"
      />
      <TextField
        label={s.passwordLabel}
        name="password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        maxLength={LIMITS.password}
        isReadOnly={isPending}
        isIdentifier
        dir="ltr"
        inputRef={passwordRef}
        endSlot={
          <Button
            variant="icon"
            icon={showPassword ? "eyeOff" : "eye"}
            aria-label={s.showPassword}
            aria-pressed={showPassword}
            onPress={() => setShowPassword((visible) => !visible)}
          />
        }
      />
      <Button
        type="submit"
        isPending={isPending}
        isDisabled={!canSubmit && !isPending}
        className="mt-2 w-full"
      >
        {isPending ? s.signingIn : s.signIn}
      </Button>
    </Form>
  );
}
