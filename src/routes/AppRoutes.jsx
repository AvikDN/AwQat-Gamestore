import { Routes, Route } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        {/* Add other pages here. They will automatically get the layout. */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;