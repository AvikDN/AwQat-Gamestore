import { Routes, Route } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Product from "../pages/Product";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Product" element={<Product />} />
        <Route path="/Product/1" element={<Product />} />
        <Route path="/Product/2" element={<Product />} />
        <Route path="/Product/10" element={<Product />} />
        
       {/* <Route path="/product/:id" element={<ProductDetails />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;