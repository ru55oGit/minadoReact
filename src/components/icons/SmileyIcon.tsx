import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export type SmileyMood = "happy" | "sad" | "cool";

interface SmileyIconProps extends SvgIconProps {
  mood: SmileyMood;
}

// Carita clásica del botón de reinicio del buscaminas — dibujada a mano
// (no emoji 🙂😵😎): ya aprendimos con la bandera/bomba que un emoji cae a
// un glifo de reemplazo irreconocible en dispositivos sin fuente de color,
// un SVG propio se ve igual en cualquier lado.
export default function SmileyIcon({ mood, ...props }: SmileyIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#ffd500" stroke="#000" strokeWidth="1.2" />
      {mood === "sad" ? (
        <>
          <path d="M6.5 7.5L9.5 10.5M9.5 7.5L6.5 10.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M14.5 7.5L17.5 10.5M17.5 7.5L14.5 10.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7.5 17C8.5 14.8 15.5 14.8 16.5 17" stroke="#000" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {mood === "cool" ? (
            <path d="M5.5 8.5h6v2.3a3 3 0 0 1-3 3 3 3 0 0 1-3-3V8.5ZM12.5 8.5h6v2.3a3 3 0 0 1-3 3 3 3 0 0 1-3-3V8.5Z" fill="#000" />
          ) : (
            <>
              <circle cx="8.3" cy="9.5" r="1.3" fill="#000" />
              <circle cx="15.7" cy="9.5" r="1.3" fill="#000" />
            </>
          )}
          <path d="M7.5 14.5C8.5 17 15.5 17 16.5 14.5" stroke="#000" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
    </SvgIcon>
  );
}
