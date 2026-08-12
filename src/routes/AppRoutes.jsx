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
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
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
        {/* <Route path="/dashboard/categories" element={<Categories />} /> */}
          
      </Route>
    </Routes>
    </>
  );
};

export default AppRoutes;