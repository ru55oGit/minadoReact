import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

interface HeartIconProps extends SvgIconProps {
  // Lleno (vida disponible) o solo contorno (vida ya perdida) — color lo
  // sigue decidiendo quien lo usa (currentColor), no es fijo como
  // MineIcon/ClassicFlagIcon.
  filled?: boolean;
}

// Dibujado a mano (no emoji ❤️/🤍): mismo criterio que el resto de los
// íconos del tablero — un SVG propio se ve igual en cualquier lado, sin
// depender de qué fuente de emoji tenga el dispositivo.
export default function HeartIcon({ filled = true, ...props }: HeartIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
      />
    </SvgIcon>
  );
}
