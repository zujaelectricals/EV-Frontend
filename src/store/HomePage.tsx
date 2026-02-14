import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import {
  ArrowRight,
  Battery,
  Shield,
  Headphones,
  Truck,
  Zap,
  Leaf,
  Award,
  ChevronRight,
  Sparkles,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScooterCard } from "./ScooterCard";
import { StoreNavbar } from "./StoreNavbar";
import { Footer } from "@/components/Footer";
import { useGetVehiclesQuery } from "@/app/api/inventoryApi";
import { mapVehicleGroupsToScooters } from "./utils/vehicleMapper";
import { FloatingPetals } from "@/components/FloatingPetals";

// Hero background image URL (public folder; encode for spaces/special chars)
const HERO_BG_URL = encodeURI("/ChatGPT Image Jan 29, 2026, 12_31_29 PM.png");

// HomePage component
export function HomePage() {
  // Scroll to top on mount to prevent stutter - use requestAnimationFrame for smoother transition
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  // Enable smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Fetch featured vehicles from API (limit to 4, status available)
  // This API call remains completely unaffected by animations
  const { data: inventoryData, isLoading, error } = useGetVehiclesQuery({
    page: 1,
    page_size: 4,
    status: 'available',
  });

  // Map API response to Scooter format
  const featuredScooters = inventoryData?.results 
    ? mapVehicleGroupsToScooters(inventoryData.results)
    : [];

  const benefits = [
    {
      icon: Battery,
      title: "Extended Range",
      desc: "Up to 200km on single charge",
    },
    { icon: Zap, title: "Fast Charging", desc: "0-80% in just 45 minutes" },
    { icon: Shield, title: "5 Year Warranty", desc: "Comprehensive coverage" },
    {
      icon: Truck,
      title: "Free Delivery",
      desc: "Doorstep delivery pan-India",
    },
  ];

  // Ref for Key Features & Services section
  const featuresSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: featuresSectionRef,
    offset: ["start 0.9", "end 0.1"],
  });

  const features = [
    {
      icon: Zap,
      title: "High-efficiency electric motors",
      desc: "Powerful motors tuned for smooth, everyday performance.",
    },
    {
      icon: Battery,
      title: "Advanced lithium battery",
      desc: "Long‑range lithium battery with rapid charging support.",
    },
    {
      icon: Shield,
      title: "Reinforced safety systems",
      desc: "Upgraded suspension and brakes for confident control.",
    },
    {
      icon: Leaf,
      title: "Smart & eco-friendly",
      desc: "Smart dashboard, app features, and silent zero‑emission rides.",
    },
  ];

  const services = [
    {
      icon: Truck,
      title: "Electric scooter sales",
      desc: "Wide range of models tailored for city commutes and daily use.",
    },
    {
      icon: Award,
      title: "Easy EMI & finance",
      desc: "Flexible EMI plans and finance assistance for stress-free ownership.",
    },
    {
      icon: Headphones,
      title: "After-sales & support",
      desc: "Dedicated service, maintenance, and genuine spare parts support.",
    },
    {
      icon: Battery,
      title: "Test rides & guidance",
      desc: "Expert guidance and test rides to help you choose the perfect scooter.",
    },
  ];

  // Key Features title - slide up only, no fade with smooth easing
  const featuresTitleY = useTransform(scrollYProgress, [0, 0.08], [20, 0], {
    clamp: false,
  });

  // Create scroll progress transforms for each feature item (5 items)
  // Features slide up sequentially: 0% - 50% of scroll progress with smooth easing
  const feature0Y = useTransform(scrollYProgress, [0.08, 0.18], [30, 0], {
    clamp: false,
  });
  const feature1Y = useTransform(scrollYProgress, [0.18, 0.28], [30, 0], {
    clamp: false,
  });
  const feature2Y = useTransform(scrollYProgress, [0.28, 0.38], [30, 0], {
    clamp: false,
  });
  const feature3Y = useTransform(scrollYProgress, [0.38, 0.48], [30, 0], {
    clamp: false,
  });
  const feature4Y = useTransform(scrollYProgress, [0.48, 0.58], [30, 0], {
    clamp: false,
  });

  // Services title - slide up only, no fade with smooth easing
  const servicesTitleY = useTransform(scrollYProgress, [0.58, 0.65], [20, 0], {
    clamp: false,
  });

  // Create scroll progress transforms for each service item (5 items)
  // Services slide up sequentially: 50% - 100% of scroll progress with smooth easing
  // Evenly distributed ranges to maintain consistent spacing during scroll
  const service0Y = useTransform(scrollYProgress, [0.65, 0.72], [30, 0], {
    clamp: false,
  });
  const service1Y = useTransform(scrollYProgress, [0.72, 0.79], [30, 0], {
    clamp: false,
  });
  const service2Y = useTransform(scrollYProgress, [0.79, 0.86], [30, 0], {
    clamp: false,
  });
  const service3Y = useTransform(scrollYProgress, [0.86, 0.93], [30, 0], {
    clamp: false,
  });
  const service4Y = useTransform(scrollYProgress, [0.93, 1.0], [30, 0], {
    clamp: false,
  });

  // Arrays of transforms for easier mapping (only Y transforms, no opacity)
  const featureTransforms = [
    { y: feature0Y },
    { y: feature1Y },
    { y: feature2Y },
    { y: feature3Y },
    { y: feature4Y },
  ];

  const serviceTransforms = [
    { y: service0Y },
    { y: service1Y },
    { y: service2Y },
    { y: service3Y },
    { y: service4Y },
  ];

  // Parallax transforms for static background effect (reduced movement for smoother desktop performance)
  const backgroundY1 = useTransform(scrollYProgress, [0, 1], [0, -30], {
    clamp: false,
  });
  const backgroundY2 = useTransform(scrollYProgress, [0, 1], [0, -20], {
    clamp: false,
  });

  // Smooth scroll progress for page-wide animations
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pageScrollProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring animation for scroll progress
  const smoothScrollProgress = useSpring(pageScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Fade in/out animations based on scroll
  const heroOpacity = useTransform(smoothScrollProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(smoothScrollProgress, [0, 0.3], [1, 0.95]);

  return (
    <div ref={pageRef} className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Floating Petals Animation */}
      <FloatingPetals count={20} />
      
      <StoreNavbar />

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          opacity: heroOpacity,
          scale: heroScale,
        }}
      >
        {/* Hero background video */}
        <video
          src="/Banner_videos/Zuja_bg3.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          aria-hidden
        />
        
        {/* Overlay for text readability */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: "linear-gradient(to right, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.35) 100%)",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-8"
            >
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#A8E6F0]/30"
                style={{
                  background: 'linear-gradient(to right, #ADDDDD 0%, #DDF9F0 100%)'
                }}
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-sm text-teal-700 font-medium">
                  The Future of Urban Mobility
                </span>
                <Zap className="w-4 h-4 text-orange-500" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-foreground">Ride The</span>
                <br />
                <span className="bg-gradient-to-r from-[#16b0bb] to-[#15bba1] bg-clip-text text-transparent">Electric Wave</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-lg">
                Experience the perfect blend of style, performance, and sustainability. Our electric scooters are designed for the modern urban explorer.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/scooters">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-white group border-none rounded-full px-8 py-6"
                    style={{
                      background: 'linear-gradient(to right, #20C9C9 0%, #3ADF77 100%)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #1BB5B5 0%, #32D06A 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #20C9C9 0%, #3ADF77 100%)';
                    }}
                  >
                    Explore Scooters
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Benefits - same animated border effect as Contact section */}
      <motion.section 
        className="relative py-20 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* CSS for animated moving border (same as Contact section) */}
        <style>{`
          @keyframes borderRotateBenefits {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animated-border-card-benefits {
            position: relative;
            background: white;
            border-radius: 1rem;
            overflow: hidden;
          }
          .animated-border-card-benefits::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
              from 0deg,
              transparent 0deg 60deg,
              #ec4899 60deg 120deg,
              transparent 120deg 180deg,
              #f472b6 180deg 240deg,
              transparent 240deg 300deg,
              #ec4899 300deg 360deg
            );
            animation: borderRotateBenefits 4s linear infinite;
            opacity: 1;
          }
          .animated-border-card-benefits::after {
            content: '';
            position: absolute;
            inset: 2px;
            background: white;
            border-radius: calc(1rem - 2px);
            z-index: 1;
          }
          .animated-border-card-benefits .card-content {
            position: relative;
            z-index: 2;
          }
        `}</style>

        {/* Horizontal gradient background - Light teal to white to soft lavender */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #e0f7fa 0%, #ffffff 50%, #f8eaf0 100%)',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <div
                  className="animated-border-card-benefits p-6 transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="card-content flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      }}
                    >
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Key Features & Services */}
      <motion.section
        ref={featuresSectionRef}
        className="relative overflow-hidden"
        style={{
          minHeight: "115vh",
          paddingTop: "3rem",
          paddingBottom: "3rem",
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Solid gradient background - Ultra light pink with yellow accents */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background:
              "linear-gradient(135deg, rgba(255, 251, 255, 0.98) 0%, rgba(255, 255, 255, 1) 30%, rgba(255, 253, 250, 1) 50%, rgba(255, 255, 255, 1) 70%, rgba(255, 251, 255, 0.98) 100%)",
          }}
        />

        {/* Enhanced Background decorative elements - Ultra light pink with premium yellow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {/* Larger, more vibrant glowing orbs - Ultra light pink with yellow accents */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-100/25 via-amber-100/20 to-rose-100/25 rounded-full blur-3xl"
            style={{
              y: backgroundY1,
              transform: "translateZ(0)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-amber-100/25 via-pink-100/20 to-yellow-100/25 rounded-full blur-3xl"
            style={{
              y: backgroundY2,
              transform: "translateZ(0)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.28, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          {/* Additional smaller accent orbs with yellow */}
          <motion.div
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-50/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.12, 0.22, 0.12],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-amber-50/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.12, 0.22, 0.12],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="w-full max-w-7xl mx-auto py-8 sm:py-12">
            {/* Unified Heading Section */}
            <motion.div
              className="text-center mb-12 sm:mb-16"
              style={{
                y: featuresTitleY,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 30 }}
            >
              {/* Why Choose Zuja - Introductory phrase */}
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                <span className="text-sm sm:text-base text-pink-500 font-medium">
                  Why Choose Zuja
                </span>
              </div>
              
              {/* Designed for Excellence - Main heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                <span className="text-foreground">Designed for </span>
                <span className="bg-gradient-to-r from-pink-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">Excellence</span>
              </h2>
              
              {/* Subheading */}
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                Every detail engineered for the ultimate riding experience
              </p>
            </motion.div>

            {/* Key Features */}
            <div className="mb-16 sm:mb-24">
              <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="group relative h-full mx-2 lg:mx-3"
                  >
                    {/* Glowing background effect - Ultra light pink with premium yellow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-200 via-amber-200 to-rose-200 rounded-3xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
                    
                    <div
                      className="relative h-full w-full rounded-3xl p-7 sm:p-8 flex flex-col items-start justify-between gap-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] min-h-[280px] sm:min-h-[320px] overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(255, 251, 255, 0.97) 50%, rgba(255, 253, 250, 0.97) 50%, rgba(255,255,255,0.99) 100%)",
                        border: "2px solid rgba(251, 191, 36, 0.15)",
                        boxShadow: "0 20px 60px rgba(251, 191, 36, 0.08), 0 8px 24px rgba(244, 114, 182, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
                      }}
                    >
                      {/* Animated gradient overlay on hover - Pink and yellow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/0 via-amber-100/0 to-rose-100/0 group-hover:from-pink-100/6 group-hover:via-amber-100/6 group-hover:to-rose-100/6 transition-all duration-500 rounded-3xl" />
                      
                      {/* Premium shimmer effect with yellow accent */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-amber-50/40 to-transparent skew-x-12" />
                      </div>

                      {/* Icon container with ultra light pink and premium yellow */}
                      <motion.div
                        className="relative inline-flex items-center justify-center rounded-2xl p-4 bg-gradient-to-br from-pink-200/25 via-amber-200/20 to-rose-200/25 group-hover:from-pink-300/30 group-hover:via-amber-300/25 group-hover:to-rose-300/30 transition-all duration-500"
                        style={{
                          boxShadow: "0 8px 24px rgba(251, 191, 36, 0.15), 0 4px 12px rgba(244, 114, 182, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
                        }}
                        whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-8 h-8 text-pink-500 group-hover:text-amber-500 transition-colors duration-300 drop-shadow-sm" />
                        {/* Premium pulsing glow effect with yellow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-200/30 via-amber-200/30 to-rose-200/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      </motion.div>

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-pink-500 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                            {feature.desc}
                          </p>
                        </div>
                      </div>

                      {/* Premium decorative corner accent with yellow */}
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-amber-200/10 via-pink-200/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Our Services */}
            <div className="mt-16 sm:mt-20">
              <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="group relative h-full mx-2 lg:mx-3"
                  >
                    {/* Glowing background effect - Ultra light pink with premium yellow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 via-pink-200 to-rose-200 rounded-3xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
                    
                    <div
                      className="relative h-full w-full rounded-3xl p-7 sm:p-8 flex flex-col items-start justify-between gap-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] min-h-[280px] sm:min-h-[320px] overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(255, 253, 250, 0.97) 50%, rgba(255, 251, 255, 0.97) 50%, rgba(255,255,255,0.99) 100%)",
                        border: "2px solid rgba(251, 191, 36, 0.15)",
                        boxShadow: "0 20px 60px rgba(251, 191, 36, 0.08), 0 8px 24px rgba(244, 114, 182, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
                      }}
                    >
                      {/* Animated gradient overlay on hover - Pink and yellow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 via-pink-100/0 to-rose-100/0 group-hover:from-amber-100/6 group-hover:via-pink-100/6 group-hover:to-rose-100/6 transition-all duration-500 rounded-3xl" />
                      
                      {/* Premium shimmer effect with yellow accent */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-amber-50/40 to-transparent skew-x-12" />
                      </div>

                      {/* Icon container with ultra light pink and premium yellow */}
                      <motion.div
                        className="relative inline-flex items-center justify-center rounded-2xl p-4 bg-gradient-to-br from-amber-200/25 via-pink-200/20 to-rose-200/25 group-hover:from-amber-300/30 group-hover:via-pink-300/25 group-hover:to-rose-300/30 transition-all duration-500"
                        style={{
                          boxShadow: "0 8px 24px rgba(251, 191, 36, 0.15), 0 4px 12px rgba(244, 114, 182, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
                        }}
                        whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <service.icon className="w-8 h-8 text-amber-500 group-hover:text-pink-500 transition-colors duration-300 drop-shadow-sm" />
                        {/* Premium pulsing glow effect with yellow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-200/30 via-pink-200/30 to-rose-200/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      </motion.div>

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-amber-500 transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                            {service.desc}
                          </p>
                        </div>
                      </div>

                      {/* Premium decorative corner accent with yellow */}
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-pink-200/10 via-amber-200/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Scooters */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Featured Scooters
              </h2>
              <p className="text-muted-foreground">
                Discover our most popular electric rides
              </p>
            </div>
            <Link
              to="/scooters"
              className="hidden md:flex items-center gap-2 text-primary hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-card border border-border/80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load featured scooters. Please try again later.</p>
            </div>
          ) : featuredScooters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredScooters.map((scooter, i) => (
                <ScooterCard key={scooter.id} scooter={scooter} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured scooters available at the moment.</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/scooters">
              <Button variant="outline">View All Scooters</Button>
            </Link>
          </div>
        </div>
      </motion.section>


      {/* CTA Section */}
      <motion.section 
        className="py-20 w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden w-full px-8 py-16 sm:px-12 sm:py-20 lg:px-24 lg:py-24"
          style={{
            background: 'linear-gradient(to bottom, #24C0CA 0%, #3ACF8C 100%)',
            minHeight: '400px',
          }}
        >
          {/* White circular particles/speckles scattered across */}
          <div className="pointer-events-none absolute inset-0">
              {/* Multiple white circular particles for starry effect */}
              {[...Array(30)].map((_, i) => {
                const positions = [
                  { top: '10%', left: '15%', size: 'w-1 h-1' },
                  { top: '20%', left: '25%', size: 'w-1.5 h-1.5' },
                  { top: '15%', left: '45%', size: 'w-1 h-1' },
                  { top: '25%', left: '60%', size: 'w-2 h-2' },
                  { top: '30%', left: '35%', size: 'w-1 h-1' },
                  { top: '35%', left: '70%', size: 'w-1.5 h-1.5' },
                  { top: '40%', left: '20%', size: 'w-1 h-1' },
                  { top: '45%', left: '50%', size: 'w-2 h-2' },
                  { top: '50%', left: '80%', size: 'w-1 h-1' },
                  { top: '55%', left: '30%', size: 'w-1.5 h-1.5' },
                  { top: '60%', left: '65%', size: 'w-1 h-1' },
                  { top: '65%', left: '40%', size: 'w-2 h-2' },
                  { top: '70%', left: '75%', size: 'w-1 h-1' },
                  { top: '75%', left: '25%', size: 'w-1.5 h-1.5' },
                  { top: '80%', left: '55%', size: 'w-1 h-1' },
                  { top: '12%', left: '75%', size: 'w-1 h-1' },
                  { top: '18%', left: '85%', size: 'w-1.5 h-1.5' },
                  { top: '22%', left: '10%', size: 'w-1 h-1' },
                  { top: '28%', left: '90%', size: 'w-2 h-2' },
                  { top: '32%', left: '5%', size: 'w-1 h-1' },
                  { top: '38%', left: '95%', size: 'w-1.5 h-1.5' },
                  { top: '42%', left: '8%', size: 'w-1 h-1' },
                  { top: '48%', left: '12%', size: 'w-2 h-2' },
                  { top: '52%', left: '88%', size: 'w-1 h-1' },
                  { top: '58%', left: '92%', size: 'w-1.5 h-1.5' },
                  { top: '62%', left: '3%', size: 'w-1 h-1' },
                  { top: '68%', left: '15%', size: 'w-2 h-2' },
                  { top: '72%', left: '85%', size: 'w-1 h-1' },
                  { top: '78%', left: '45%', size: 'w-1.5 h-1.5' },
                  { top: '85%', left: '70%', size: 'w-1 h-1' },
                ];
                const pos = positions[i % positions.length];
                return (
                  <div
                    key={i}
                    className={`absolute ${pos.size} bg-white/20 rounded-full`}
                    style={{
                      top: pos.top,
                      left: pos.left,
                    }}
                  />
                );
              })}
          </div>

          <div className="relative z-10 mx-auto text-center space-y-6" style={{ maxWidth: '900px' }}>
            {/* Badge: Join 10,000+ Happy Riders */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(230, 246, 247, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Sparkles className="w-4 h-4 text-slate-800" />
              <span className="text-sm font-medium text-slate-800">Join 10,000+ Happy Riders</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white">
              Ready to Go Electric?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed">
              Book a free test ride today and experience the future of urban mobility.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-slate-800 border-none shadow-lg transition-all duration-200 font-medium"
                  style={{
                    background: 'rgba(230, 246, 247, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(230, 246, 247, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(230, 246, 247, 0.8)';
                  }}
                >
                  Book Test Ride
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/scooters" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-6 border-2 border-white shadow-lg transition-all duration-200 font-medium"
                  style={{
                    background: '#30CBD0',
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#1ab7bf';
                    e.currentTarget.style.borderColor = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#30CBD0';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'white';
                  }}
                >
                  Explore Models
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <Footer />
    </div>
  );
}
