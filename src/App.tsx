import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HomePage } from "./pages/HomePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import OTPCompletePage from "./pages/OTPCompletePage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />
            <Route path="/complete-signup" element={<OTPCompletePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
