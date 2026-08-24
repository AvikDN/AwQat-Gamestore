import { Outlet } from "react-router";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import bgVideo from "../assets/pics/BGs/BG snow.webm"; 
import bgImg from "../assets/pics/BGs/bg.jpg";
import BouncingLogo from "../components/BouncingLogo";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      
      {/* Mobile Static Background Image (Visible only on small screens) */}
      <img
        src={bgImg}
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover object-center z-0 md:hidden block"
      />

      {/* Desktop Background Video (Hidden on mobile to prevent lag/battery drain) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={bgImg}
        className="fixed inset-0 w-full h-full object-cover object-center z-0 hidden md:block"
      >
        <source src={bgVideo} type="video/webm" />
      </video>

      {/* Bouncing Logo Overlay */}
      <BouncingLogo />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;