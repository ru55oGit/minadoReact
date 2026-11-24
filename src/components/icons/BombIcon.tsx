import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

// No hay un ícono de "bomba" en @mui/icons-material — se dibuja a mano,
// bien simple (cuerpo redondo + mecha + chispa), para no depender del
// emoji 💣: en dispositivos/navegadores sin fuente de emoji a color cae a
// un glifo de reemplazo irreconocible (reporte real: solo se veía un
// triángulo rojo en vez de una bandera o una bomba).
export default function BombIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="11" cy="14.5" r="7" fill="currentColor" />
      <path d="M15 9.5L18.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19.3" cy="5.2" r="1.7" fill="currentColor" />
    </SvgIcon>
  );
}
