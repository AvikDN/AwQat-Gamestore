import { Routes, Route } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import ProductList from "../pages/ProductList";
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
        
      </Route>
    </Routes>
    </>
  );
};

export default AppRoutes;