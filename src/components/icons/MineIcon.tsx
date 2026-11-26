import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

// Réplica del sprite clásico de mina del buscaminas de Windows: cuerpo
// redondo negro con 8 púas (4 líneas cruzadas) y un brillito blanco —
// colores fijos, no "currentColor": en el original la mina se ve igual
// sin importar el fondo de la celda (incluso en la celda roja donde
// explotó).
export default function MineIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <g stroke="#000" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
        <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
      </g>
      <circle cx="12" cy="12" r="6" fill="#000" />
      <circle cx="9.7" cy="9.7" r="1.3" fill="#fff" />
    </SvgIcon>
  );
}
