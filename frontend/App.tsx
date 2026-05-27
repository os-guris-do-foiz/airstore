import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import AdsListing from "./pages/ads/AdsListing";
import AdDetail from "./pages/ads/AdDetail";
import CreateAd from "./pages/ads/CreateAd";
import UserProfile from "./pages/user/UserProfile";
import About from "./pages/About";
import Teams from "./pages/teams/Teams";
import Campos from "./pages/fields/Campos";
import CampoDetail from "./pages/fields/CampoDetail";
import PainelCampo from "./pages/fields/PainelCampo";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PainelCampoConfig from "./pages/fields/PainelCampoConfig";
import Avisos from "./pages/info/Avisos";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ads" element={<AdsListing />} />
          <Route path="/ads/:id" element={<AdDetail />} />
          <Route path="/ads/new" element={<CreateAd />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/campos" element={<Campos />} />
          <Route path="/campos/:id" element={<CampoDetail />} />
          <Route path="/painel-campo" element={<PainelCampo />} />
          <Route path="/painel-campo/config" element={<PainelCampoConfig />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Fallbacks */}
          <Route path="/services" element={<AdsListing />} />
          <Route
            path="/terms"
            element={
              <div className="py-20 text-center text-gray-500">
                Termos de Uso
              </div>
            }
          />
          <Route
            path="/privacy"
            element={
              <div className="py-20 text-center text-gray-500">Privacidade</div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="py-20 text-center text-gray-500">Contato</div>
            }
          />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
