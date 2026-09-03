import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HomeAdSlider from "@/components/HomeAdSlider";
import Navbar from "@/components/Navbar";
import VehicleCategoryGrid from "@/components/VehicleCategoryGrid";
import VehicleLogoSlider from "@/components/VehicleLogoSlider";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <VehicleCategoryGrid />
      <VehicleLogoSlider />
      <HomeAdSlider />
      <Footer />
    </div>
  );
}
