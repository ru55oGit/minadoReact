import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import Layout from "../components/Layout";
import { useIsMobile } from "../hooks/useIsMobile";

const ACCENT = "#e74c3c";
const HUB_URL = "https://www.boludeando.com";

// Vidriera estática de la mecánica (no el puzzle real del día, ese vive en
// game.tsx) — mismo criterio que el resto del hub: datos de ejemplo fijos
// que alcanzan para entender de un vistazo de qué va el juego.
const PREVIEW_FOUND: Record<string, string> = { "1-1": "M", "3-2": "A" };
const PREVIEW_NUMBERS: Record<string, number> = { "0-3": 2, "2-0": 1 };

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buen día ☀️";
  if (hour < 20) return "Buenas tardes 🌤️";
  return "Buenas noches 🌙";
}

export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Mismo tamaño que boardSize por default en EmojiCarousel de
  // enroscaloReact (250) — la card gris de atrás SÍ usa aspectRatio:1 a
  // width:100%, como el original: eso solo era un problema cuando el
  // ancho de la página no estaba acotado (ver Layout), ya resuelto.
  const previewSize = isMobile ? 220 : 250;

  return (
    <Layout showFooter={false}>
      <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10, display: "flex", justifyContent: "center" }}>
        <Box
          component="header"
          sx={{
            display: "flex", alignItems: "center",
            height: 80, px: 2,
            boxSizing: "border-box",
            borderBottom: `2px solid ${ACCENT}`,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            width: { xs: "100%", md: "480px" }, position: "relative",
          }}
        >
          <Box component="a" href={HUB_URL} aria-label="Volver" sx={{ display: "flex", alignItems: "center", zIndex: 1 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path d="M26 6L14 19L26 32" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Box
            component="a"
            href={HUB_URL}
            sx={{
              position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
              fontFamily: "Lobster, cursive", fontSize: 28, color: ACCENT, textDecoration: "none",
            }}
          >
            Boludeando
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pt: "80px", pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="h2"
            sx={{ color: "#fff", fontWeight: 700, letterSpacing: "1px", fontFamily: "Lobster, cursive", textAlign: "center", width: "100%" }}
          >
            Minado
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "rgba(255, 255, 255, 0.64)", fontStyle: "italic", letterSpacing: "2px", width: "100%", textAlign: "center", fontSize: { xs: 18, md: 22 } }}
          >
            buscá · encontrá · resolvé
          </Typography>
        </Box>

        <Typography sx={{ color: "#ffe6e6", fontSize: 18, fontWeight: 600 }}>{timeGreeting()}</Typography>

        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>¿Listo para jugar?</Typography>

        <Box sx={{ width: "100%", borderRadius: 6, backgroundColor: "#eb6f62", p: 2, boxShadow: "0 12px 24px rgba(0,0,0,0.18)" }}>
          <Box
            sx={{
              width: "100%", aspectRatio: "1", borderRadius: 4, backgroundColor: "#f3f3f3",
              display: "flex", alignItems: "center", justifyContent: "center",
              p: 1.25, mb: 2,
            }}
          >
            <Box
              sx={{
                transform: "scale(0.95)",
                width: previewSize, height: previewSize,
                display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(5, 1fr)", gap: "6px",
              }}
            >
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 5 }, (_, c) => {
                  const key = `${r}-${c}`;
                  const letter = PREVIEW_FOUND[key];
                  const number = PREVIEW_NUMBERS[key];
                  return (
                    <Box
                      key={key}
                      sx={{
                        borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 22,
                        color: number ? ACCENT : "transparent",
                        backgroundColor: letter ? "#2ecc71" : number ? "#f3f3f3" : "#fff",
                        boxShadow: !letter && !number ? `inset 0 0 0 2px ${ACCENT}55` : "none",
                      }}
                    >
                      {/* Letra reclamada con bandera: en el juego real solo
                          se ve la banderita en la grilla, nunca la letra. */}
                      {letter && <FlagRoundedIcon sx={{ fontSize: 22, color: "#fff" }} />}
                      {number}
                    </Box>
                  );
                }),
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => navigate("/game")}
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: "28px !important" }} />}
              sx={{
                backgroundColor: "#fff", color: "#c63b2e", fontWeight: 800, borderRadius: 999,
                px: 3, py: 1.4, fontSize: 18,
                boxShadow: "0 0 0 4px rgba(255,255,255,0.35), 0 10px 24px rgba(0,0,0,0.4)",
                "&:hover": { backgroundColor: "#fff", boxShadow: "0 0 0 4px rgba(255,255,255,0.5), 0 12px 26px rgba(0,0,0,0.45)" },
              }}
            >
              JUGAR
            </Button>

            <Box sx={{ textAlign: { xs: "left", md: "right" }, color: "#fff", fontWeight: 700 }}>
              <Typography sx={{ fontSize: 18 }}>EL MINADO DE HOY</Typography>
              <Typography sx={{ fontSize: 16 }}>4 pistas · 1 palabra final</Typography>
            </Box>
          </Box>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 4, px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
            ¿Qué es Minado?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            Minado es un buscaminas distinto: en vez de minas, lo que se esconde en la grilla son
            letras — las de 4 palabras-pista mezcladas en un solo tablero. Encontrá las letras de
            cada pista para descubrirlas, y usalas para adivinar la palabra final del día.
          </Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 4, px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
            ¿Cómo jugar?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            Un buscaminas común, con el riesgo real de siempre: tocá una celda para revelarla. Si
            es simple, te muestra un número con la cantidad de letras escondidas entre sus
            vecinas, igual que la cuenta de minas del buscaminas de toda la vida. Pero si tocás
            directo una celda de letra sin marcarla antes, es una bomba. Para sumarla sin
            arriesgar, marcála con bandera (click derecho en computadora, o el modo Bandera en el
            celular) — la grilla solo muestra la banderita, la letra baja a la tarjeta de su pista
            correspondiente. Arrastrá esas letras para ordenarlas y descubrir cada palabra-pista, y
            usalas para adivinar la palabra final, siempre en la misma pantalla.
          </Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 4, px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}>
            Preguntas frecuentes
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>¿Puedo perder?</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                Sí: si tocás directo una celda de letra sin marcarla antes con bandera, es una
                bomba y ya no podés seguir destapando — pero igual podés intentar adivinar la
                palabra final con las letras que hayas encontrado hasta ese momento.
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>¿Tengo que encontrar todas las letras antes de adivinar?</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                No, podés intentarlo en cualquier momento con las letras que ya tengas — a veces
                alcanza con dos o tres para darte cuenta de cuál es la palabra.
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>¿Es gratis?</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                Sí, jugar a Minado es completamente gratis.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
