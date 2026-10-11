"use client";

import { InputHTMLAttributes, useState } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * A plain password input with a show/hide eye button on the right edge.
 * The button only appears once there's text to reveal.
 * Works both controlled (pass `value`/`onChange`, as in the reset-password
 * form) and uncontrolled (as in AuthForm, which reads values via FormData).
 */
export default function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  const [uncontrolledHasText, setUncontrolledHasText] = useState(
    () => String(props.defaultValue ?? "").length > 0,
  );
  const isControlled = props.value !== undefined;
  const hasText = isControlled
    ? String(props.value ?? "").length > 0
    : uncontrolledHasText;

  return (
    <div className="password-input-wrap">
      <input
        {...props}
        type={visible && hasText ? "text" : "password"}
        onChange={(e) => {
          if (!isControlled) setUncontrolledHasText(e.target.value.length > 0);
          props.onChange?.(e);
        }}
      />
      {hasText && (
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      )}
    </div>
  );
}

// Plain eye, no stroke through it — shown while the password is visible as plain text.
function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Eye with a diagonal stroke through it — shown while the password is masked/hidden.
function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="2.5" y1="21.5" x2="21.5" y2="2.5" />
    </svg>
  );
}
