import { useEffect } from "react";
import { seedDatabase } from "@/lib/db";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import HivesPage from "./pages/HivesPage";
import StorePage from "./pages/StorePage";
import SchedulePage from "./pages/SchedulePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import InspectionPage from "./pages/InspectionPage";
import SeasonsPage from "./pages/SeasonsPage";
import WeatherPage from "./pages/WeatherPage";
import EducationPage from "./pages/EducationPage";
import ExpertsPage from "./pages/ExpertsPage";
import MapPage from "./pages/MapPage";
import QRCodePage from "./pages/QRCodePage";
import TreatmentsPage from "./pages/TreatmentsPage";
import FeedingCalcPage from "./pages/FeedingCalcPage";
import SmokerTimerPage from "./pages/SmokerTimerPage";
import ExportPage from "./pages/ExportPage";
import QueenLineagePage from "./pages/QueenLineagePage";
import ROIPage from "./pages/ROIPage";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading, authEnabled } = useAuth();

  useEffect(() => {
    seedDatabase();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full gradient-honey animate-pulse" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (authEnabled && !user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/hives" element={<HivesPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/inspection/:hiveId" element={<InspectionPage />} />
      <Route path="/seasons" element={<SeasonsPage />} />
      <Route path="/weather" element={<WeatherPage />} />
      <Route path="/education" element={<EducationPage />} />
      <Route path="/experts" element={<ExpertsPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/qrcode" element={<QRCodePage />} />
      <Route path="/treatments" element={<TreatmentsPage />} />
      <Route path="/feeding" element={<FeedingCalcPage />} />
      <Route path="/smoker-timer" element={<SmokerTimerPage />} />
      <Route path="/export" element={<ExportPage />} />
      <Route path="/queens" element={<QueenLineagePage />} />
      <Route path="/roi" element={<ROIPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

function LoginRoute() {
  const { user, loading, authEnabled } = useAuth();
  if (loading) return null;
  if (!authEnabled || user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default App;
