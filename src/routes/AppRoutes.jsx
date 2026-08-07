import { Routes, Route } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import ProductList from "../pages/ProductList";
import FAQ from "../pages/FAQ";
import About from "../pages/AboutUs";
import Contact from "../pages/Contact";
import PnP from "../pages/PrivacyPolicy";
import TOS from "../pages/TOS";
import ScrollToTop from "../components/ScrollToTop";
import AboutUs from "../pages/AboutUs";
const AppRoutes = () => {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PnP />} />
        <Route path="/terms" element={<TOS />} />
      </Route>
    </Routes>
    </>
  );
};

export default AppRoutes;