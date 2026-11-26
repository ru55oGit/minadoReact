import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

// Réplica de la banderita clásica del buscaminas de Windows: mástil y
// base negros, paño rojo — colores fijos, no "currentColor".
export default function ClassicFlagIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="10.25" y="3" width="1.5" height="15" fill="#000" />
      <path d="M11.75 4 L19 7.5 L11.75 11 Z" fill="#d32f2f" />
      <rect x="7" y="18" width="9" height="2" fill="#000" />
    </SvgIcon>
  );
}
