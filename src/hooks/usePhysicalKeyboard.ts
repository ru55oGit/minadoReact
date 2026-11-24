import { useEffect } from "react";

interface UsePhysicalKeyboardOptions {
  onKeyPress: (key: string) => void;
  enabled?: boolean;
}

// Versión simplificada de la de enroscaloReact (sin acentos — Minado por
// ahora es un solo idioma, sin letras especiales en las palabras de
// ejemplo). Solo A-Z, Backspace y Enter.
export function usePhysicalKeyboard({ onKeyPress, enabled = true }: UsePhysicalKeyboardOptions): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key;
      const isLetter = /^[a-zA-Z]$/.test(key);
      const isBackspace = key === "Backspace";
      const isEnter = key === "Enter";
      if (!isLetter && !isBackspace && !isEnter) return;

      event.preventDefault();
      if (isBackspace) onKeyPress("{bksp}");
      else if (isEnter) onKeyPress("{enter}");
      else onKeyPress(key.toUpperCase());
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress, enabled]);
}
