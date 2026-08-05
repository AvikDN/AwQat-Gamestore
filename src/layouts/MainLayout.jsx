import { Outlet } from "react-router";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar stays at the top */}
      <Navbar />

      {/* Main content takes the remaining height */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer sticks to the bottom */}
      <Footer />
    </div>
  );
};

export default MainLayout;