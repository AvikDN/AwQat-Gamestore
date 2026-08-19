import { Routes, Route } from "react-router";
import MainLayout from "../layouts/MainLayout";
import DashLayout from "../layouts/DashLayout";
import Home from "../pages/home";
import ProductDetails from "../pages/ProductDetails";
import ProductList from "../pages/ProductList";
import FAQ from "../pages/FAQ";
import About from "../pages/AboutUs";
import Contact from "../pages/Contact";
import PnP from "../pages/PnP";
import TOS from "../pages/TOS";
import PrivateRoute from "../components/PrivateRoute";
import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories";
import CategoryGames from "../pages/CategoryGames";
import DashCategories from "../pages/DashCategories";
import DashOrders from "../pages/DashOrders";
import DashGames from "../pages/DashGames";
import DashUsers from "../pages/DashUsers";
import DashStudios from "../pages/DashStudios";
import Cart from "../pages/Cart";
import DashReviews from "../pages/DashReviews";
import AdminCart from "../pages/AdminCart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ActivationPage from "../pages/ActivationPage";
import ResendActivation from "../pages/ResendActivation";
import ResetPassword from "../pages/ResetPassword";
import ResetPasswordConfirm from "../pages/ResetPasswordConfirm";
import ScrollToTop from "../components/ScrollToTop";

const AppRoutes = () => {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryGames />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:uid/:token" element={<ActivationPage />} />
        <Route path="/resend-activation" element={<ResendActivation />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />}/>
        
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PnP />} />
        <Route path="/terms" element={<TOS />} />
      </Route>

      <Route
          element={
            <PrivateRoute>
              <DashLayout />
            </PrivateRoute>
          }
        >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/cart" element={<Cart />} />
        <Route path="/dashboard/carts" element={<AdminCart />} />
        <Route path="/dashboard/categories" element={<DashCategories />} />
        <Route path="/dashboard/reviews" element={<DashReviews />} />
        <Route path="/dashboard/orders" element={<DashOrders />} />
        <Route path="/dashboard/games" element={<DashGames />} />
        <Route path="/dashboard/users" element={<DashUsers />} />
        <Route path="/dashboard/studios" element={<DashStudios />} />
          
      </Route>
    </Routes>
    </>
  );
};

export default AppRoutes;