import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Layout from "../components/Layout";
import { useLanguage } from "../i18n/LanguageContext";

// Stub mínimo — texto real pendiente (mismo criterio que el resto del
// hub: se arma la pasada de contenido/legales después del prototipo).
export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <Layout showFooter={false}>
      <Box sx={{ px: 2, pb: 2, color: "#fff" }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          {t.menuPrivacy}
        </Typography>
        <Typography sx={{ lineHeight: 1.7, opacity: 0.9 }}>
          Texto pendiente — este es un stub del prototipo.
        </Typography>
        <Button onClick={() => navigate("/")} sx={{ color: "#fff", mt: 2 }}>
          {t.backHome}
        </Button>
      </Box>
    </Layout>
  );
}
