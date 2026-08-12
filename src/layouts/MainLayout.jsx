import { Outlet } from "react-router";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import bgImage from "../assets/pics/Categories/bg.jpg";

const MainLayout = () => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-050 pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar stays at the top */}
        <Navbar />

        {/* Main content takes the remaining height */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer sticks to the bottom */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;