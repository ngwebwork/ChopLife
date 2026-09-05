import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ToastContainer } from "@/components/common/ToastContainer";

import { Home } from "@/pages/Home";
import { Menu } from "@/pages/Menu";
import { FoodDetails } from "@/pages/FoodDetails";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { OrderConfirmation } from "@/pages/OrderConfirmation";
import { OrderTracking } from "@/pages/OrderTracking";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { NotFound } from "@/pages/NotFound";

import { AdminLogin } from "@/pages/admin/AdminLogin";
// Admin self-registration is intentionally disabled (route + link removed) so only
// existing admins can sign in. Re-add the /admin/register route and the AdminLogin
// link when it's needed again - the page and backend endpoint are still in place,
// just gated behind ALLOW_ADMIN_REGISTRATION on the backend.
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminOrders } from "@/pages/admin/AdminOrders";
import { AdminMenu } from "@/pages/admin/AdminMenu";
import { AdminCategories } from "@/pages/admin/AdminCategories";
import { AdminCustomers } from "@/pages/admin/AdminCustomers";
import { AdminSettings } from "@/pages/admin/AdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<FoodDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/order/:orderNumber" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
