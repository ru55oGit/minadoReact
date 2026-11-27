import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import Home from "./pages/Home";
import Game from "./pages/game";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
