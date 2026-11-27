import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Layout from "../components/Layout";
import HomePreviewBoard from "../components/HomePreviewBoard";
import LanguageSelector from "../components/LanguageSelector";
import SmileyIcon from "../components/icons/SmileyIcon";
import { useLanguage } from "../i18n/LanguageContext";
import { WEEK_DAY_KEYS, getCurrentDayKey, isDayAvailable, dateKeyForDayKey } from "../data/dailyPuzzles";
import { getDayProgress, scopeKeyFor, bonusScopeKey, isBonusUnlocked } from "../utils/minadoProgress";

const ACCENT = "#e74c3c";
const HUB_URL = "https://www.boludeando.com";

export default function Home() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  function timeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 20) return t.greetingAfternoon;
    return t.greetingNight;
  }

  // Semana actual + bonus — mismo criterio que enroscaloReact: días
  // futuros bloqueados (no se puede jugar por adelantado), estado por
  // día persistido en localStorage, y el bonus se desbloquea recién
  // cuando ya jugaste todos los días disponibles de la semana.
  const todayKey = getCurrentDayKey();
  const dayTiles = WEEK_DAY_KEYS.map((key) => {
    const available = isDayAvailable(key);
    const scopeKey = scopeKeyFor(currentLanguage, dateKeyForDayKey(key));
    return { key, label: t.dayLabels[key], available, progress: getDayProgress(scopeKey) };
  });
  const bonusUnlocked = isBonusUnlocked(currentLanguage);
  const bonusProgress = getDayProgress(bonusScopeKey(currentLanguage, dateKeyForDayKey(todayKey)));

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
          <Box component="a" href={HUB_URL} aria-label={t.ariaBack} sx={{ display: "flex", alignItems: "center", zIndex: 1 }}>
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

      <LanguageSelector />

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
            {t.tagline}
          </Typography>
        </Box>

        <Typography sx={{ color: "#ffe6e6", fontSize: 18, fontWeight: 600 }}>{timeGreeting()}</Typography>

        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{t.readyToPlay}</Typography>

        <Box sx={{ width: "100%", borderRadius: 6, backgroundColor: "#eb6f62", p: 2, boxShadow: "0 12px 24px rgba(0,0,0,0.18)" }}>
          <Box
            sx={{
              width: "100%", borderRadius: 4, backgroundColor: "#f3f3f3",
              display: "flex", alignItems: "center", justifyContent: "center",
              p: 1.5, mb: 2,
            }}
          >
            <HomePreviewBoard />
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
              {t.playButton}
            </Button>

            <Box sx={{ textAlign: { xs: "left", md: "right" }, color: "#fff", fontWeight: 700 }}>
              <Typography sx={{ fontSize: 18 }}>{t.todayLabel}</Typography>
              <Typography sx={{ fontSize: 16 }}>{t.todaySubtitle}</Typography>
            </Box>
          </Box>
        </Box>

        <Box component="section" sx={{ borderRadius: 4, backgroundColor: "#ededed", p: 2 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#262a33", mb: 1.5 }}>
            {t.weekSection}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
            {dayTiles.map((tile) => {
              const label = !tile.available
                ? t.unlocksOn(tile.label)
                : tile.progress.status === "completed"
                  ? tile.progress.correct ? t.statusSolved : t.statusNotSolved
                  : t.statusNotPlayed;
              const buttonLabel = !tile.available ? t.buttonLocked : tile.progress.status === "completed" ? t.buttonSeeResult : t.buttonPlay;
              return (
                <Box
                  key={tile.key}
                  onClick={() => { if (tile.available) navigate(`/game?day=${tile.key}`); }}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    border: tile.key === todayKey ? `2px solid ${ACCENT}` : "1px solid #d7d7d7",
                    p: 1.5,
                    aspectRatio: "1 / 1",
                    opacity: tile.available ? 1 : 0.55,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: tile.available ? "pointer" : "not-allowed",
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#262a33", alignSelf: "flex-start" }}>
                    {tile.label}
                  </Typography>
                  {tile.available && (
                    <SmileyIcon
                      mood={tile.progress.status === "completed" ? "happy" : "sad"}
                      sx={{ fontSize: 30 }}
                    />
                  )}
                  <Typography sx={{ fontSize: 12, color: "#7a7a7a", textAlign: "center", fontWeight: 700, mb: 1 }}>
                    {label}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!tile.available}
                    onClick={(e) => { e.stopPropagation(); navigate(`/game?day=${tile.key}`); }}
                    sx={{
                      mt: "auto", borderRadius: 999, fontWeight: 700, fontSize: 11,
                      backgroundColor: tile.available ? ACCENT : "#bcbcbc",
                      "&:hover": { backgroundColor: tile.available ? "#c0392b" : "#bcbcbc" },
                    }}
                  >
                    {buttonLabel}
                  </Button>
                </Box>
              );
            })}

            {/* Bonus — llena el 8vo lugar de la grilla de 2 columnas.
                Se desbloquea recién cuando ya jugaste todos los días
                disponibles de la semana (pedido real: "si la gente se
                copa, acuda mediante un aviso a los juegos bonus"). */}
            <Box
              onClick={() => { if (bonusUnlocked) navigate("/game?day=bonus"); }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                border: "1px solid #d7d7d7",
                p: 1.5,
                aspectRatio: "1 / 1",
                opacity: bonusUnlocked ? 1 : 0.55,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                cursor: bonusUnlocked ? "pointer" : "not-allowed",
              }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#262a33", alignSelf: "flex-start" }}>
                {t.bonusLabel}
              </Typography>
              {bonusUnlocked && (
                <SmileyIcon
                  mood={bonusProgress.status === "completed" ? "happy" : "sad"}
                  sx={{ fontSize: 30 }}
                />
              )}
              <Typography sx={{ fontSize: 12, color: "#7a7a7a", textAlign: "center", fontWeight: 700, mb: 1 }}>
                {bonusUnlocked
                  ? bonusProgress.status === "completed"
                    ? (bonusProgress.correct ? t.statusSolved : t.statusNotSolved)
                    : t.bonusAvailable
                  : t.bonusLockedMessage}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                disabled={!bonusUnlocked}
                onClick={(e) => { e.stopPropagation(); navigate("/game?day=bonus"); }}
                sx={{
                  mt: "auto", borderRadius: 999, fontWeight: 700, fontSize: 11,
                  backgroundColor: bonusUnlocked ? ACCENT : "#bcbcbc",
                  "&:hover": { backgroundColor: bonusUnlocked ? "#c0392b" : "#bcbcbc" },
                }}
              >
                {bonusUnlocked ? (bonusProgress.status === "completed" ? t.buttonSeeResult : t.buttonPlay) : t.buttonLocked}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 4, px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
            {t.whatIsTitle}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            {t.whatIsBody}
          </Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 4, px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
            {t.howToPlayTitle}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            {t.howToPlayBodyHome}
          </Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 4, px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}>
            {t.faqTitle}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>{t.faqLoseQuestion}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                {t.faqLoseAnswer}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>{t.faqAllLettersQuestion}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                {t.faqAllLettersAnswer}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>{t.faqFreeQuestion}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                {t.faqFreeAnswer}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}
