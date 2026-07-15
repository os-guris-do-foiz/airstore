import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import AdsListing from "./pages/ads/AdsListing";
import AdDetail from "./pages/ads/AdDetail";
import CreateAd from "./pages/ads/CreateAd";
import UserProfile from "./pages/user/UserProfile";
import UserSearch from "./pages/user/UserSearch";
import About from "./pages/About";
import Teams from "./pages/teams/Teams";
import TeamDetail from "./pages/teams/TeamDetail";
import Campos from "./pages/fields/Campos";
import CampoDetail from "./pages/fields/CampoDetail";
import PainelCampo from "./pages/fields/PainelCampo";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PainelCampoConfig from "./pages/fields/PainelCampoConfig";
import Avisos from "./pages/info/Avisos";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Settings from "./pages/user/Settings";
import Favorites from "./pages/user/Favorites";
import NotFound from "./pages/NotFound";
import Terms from "./pages/info/Terms";
import Privacy from "./pages/info/Privacy";
import Contact from "./pages/info/Contact";

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
          <Route path="/usuarios" element={<UserSearch />} />
          <Route path="/about" element={<About />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/campos" element={<Campos />} />
          <Route path="/campos/novo" element={<PainelCampoConfig />} />
          <Route path="/campos/:id" element={<CampoDetail />} />
          <Route path="/painel-campo" element={<PainelCampo />} />
          <Route path="/painel-campo/config/:id" element={<PainelCampoConfig />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/favoritos" element={<Favorites />} />

          <Route path="/services" element={<AdsListing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
