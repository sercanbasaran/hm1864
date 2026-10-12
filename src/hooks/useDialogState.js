import { useState } from "react";
export function useDialogState() {
  const [query, setQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  return {
    query,
    setQuery,
    showPassword,
    setShowPassword,
    loginStatus,
    setLoginStatus,
  };
}
