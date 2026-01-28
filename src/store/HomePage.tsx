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

  const stats = useMemo(() => [
    { value: "50K+", label: "Happy Riders" },
    { value: "200+", label: "Service Centers" },
    { value: "15+", label: "Cities Covered" },
    { value: "4.8★", label: "Customer Rating" },
  ], []);

  // Parse stat values and create animated counters
  const parseStatValue = (value: string) => {
    if (value.includes("K+")) {
      const num = parseFloat(value.replace("K+", ""));
      return { target: num, suffix: "K+", isDecimal: false };
    } else if (value.includes("+")) {
      const num = parseFloat(value.replace("+", ""));
      return { target: num, suffix: "+", isDecimal: false };
    } else if (value.includes("★")) {
      const num = parseFloat(value.replace("★", ""));
      return { target: num, suffix: "★", isDecimal: true };
    }
    return { target: 0, suffix: "", isDecimal: false };
  };

  const [animatedStats, setAnimatedStats] = useState([
    { current: 0, ...parseStatValue(stats[0].value) },
    { current: 0, ...parseStatValue(stats[1].value) },
    { current: 0, ...parseStatValue(stats[2].value) },
    { current: 0, ...parseStatValue(stats[3].value) },
  ]);

  // Animate stats on mount
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const parsedStats = stats.map((stat) => parseStatValue(stat.value));

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats((prev) => {
        return prev.map((stat, index) => ({
          ...stat,
          current: parsedStats[index].target * easeOutQuart,
        }));
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [stats]);

  // Format animated value for display
  const formatAnimatedValue = (stat: { current: number; suffix: string; isDecimal: boolean }) => {
    if (stat.isDecimal) {
      return `${stat.current.toFixed(1)}${stat.suffix}`;
    } else if (stat.suffix === "K+") {
      return `${Math.floor(stat.current)}${stat.suffix}`;
    } else {
      return `${Math.floor(stat.current)}${stat.suffix}`;
    }
  };

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
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/Banner_videos/video1.mp4" type="video/mp4" />
        </video>
        
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
                <span className="text-[#00C2B2]">Electric Wave</span>
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
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-[#15adc1] group rounded-full px-8 py-6 transition-all"
                    style={{
                      background: 'white',
                      border: '2px solid #15adc1',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#15adc1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#15adc1';
                    }}
                  >
                    Book a Test Ride
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: '#15adc1' }} />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-border/50">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + i * 0.05,
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="text-center"
                  >
                    <div 
                      className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#00BCD4] to-[#00E676] bg-clip-text text-transparent"
                    >
                      {formatAnimatedValue(animatedStats[i])}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section 
        className="relative py-20 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
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
                className="group relative"
              >
                {/* Liquid Glass Effect Card - iOS Style */}
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Glass background with iOS-style liquid glass effect */}
                  <div
                    className="relative p-6 backdrop-blur-2xl rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: `
                        0 8px 32px 0 rgba(16, 185, 129, 0.2),
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                        inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)
                      `,
                    }}
                  >
                    {/* Subtle inner glow and highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 flex items-start gap-4">
                      <div
                        className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(134, 239, 172, 0.3) 0%, rgba(74, 222, 128, 0.2) 100%)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow: "0 4px 16px rgba(134, 239, 172, 0.2)",
                        }}
                      >
                        <benefit.icon className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 drop-shadow-sm">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>

                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-2xl" />
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
        {/* Background Image - Fixed using background-attachment */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            backgroundImage: "url('/Vehicle1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Enhanced Overlay gradient for readability with more vibrant colors */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(135deg, rgba(209, 250, 229, 0.85) 0%, rgba(255, 255, 255, 0.90) 30%, rgba(236, 253, 245, 0.90) 50%, rgba(255, 255, 255, 0.90) 70%, rgba(209, 250, 229, 0.85) 100%)",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Enhanced Background decorative elements with more dynamic effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {/* Larger, more vibrant glowing orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/20 rounded-full blur-3xl"
            style={{
              y: backgroundY1,
              transform: "translateZ(0)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 via-teal-400/15 to-emerald-400/20 rounded-full blur-3xl"
            style={{
              y: backgroundY2,
              transform: "translateZ(0)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          {/* Additional smaller accent orbs */}
          <motion.div
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-300/15 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-cyan-300/15 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.15, 0.25, 0.15],
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
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C2B2]" />
                <span className="text-sm sm:text-base text-[#00C2B2] font-medium">
                  Why Choose Zuja
                </span>
              </div>
              
              {/* Designed for Excellence - Main heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                <span className="text-foreground">Designed for </span>
                <span className="text-[#00C2B2]">Excellence</span>
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
                    {/* Glowing background effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-3xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500 -z-10" />
                    
                    <div
                      className="relative h-full w-full rounded-3xl p-7 sm:p-8 flex flex-col items-start justify-between gap-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] min-h-[280px] sm:min-h-[320px] overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(236,253,245,0.95) 50%, rgba(255,255,255,0.95) 100%)",
                        border: "2px solid rgba(16, 185, 129, 0.2)",
                        boxShadow: "0 20px 60px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {/* Animated gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-teal-400/0 to-cyan-400/0 group-hover:from-emerald-400/10 group-hover:via-teal-400/10 group-hover:to-cyan-400/10 transition-all duration-500 rounded-3xl" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                      </div>

                      {/* Icon container with enhanced styling */}
                      <motion.div
                        className="relative inline-flex items-center justify-center rounded-2xl p-4 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 group-hover:from-emerald-500/30 group-hover:via-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-500"
                        style={{
                          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                        }}
                        whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-8 h-8 text-emerald-700 group-hover:text-emerald-600 transition-colors duration-300 drop-shadow-sm" />
                        {/* Pulsing glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      </motion.div>

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                            {feature.desc}
                          </p>
                        </div>
                      </div>

                      {/* Decorative corner accent */}
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-emerald-400/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                    {/* Glowing background effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-3xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500 -z-10" />
                    
                    <div
                      className="relative h-full w-full rounded-3xl p-7 sm:p-8 flex flex-col items-start justify-between gap-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02] min-h-[280px] sm:min-h-[320px] overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(236,253,245,0.95) 50%, rgba(255,255,255,0.95) 100%)",
                        border: "2px solid rgba(6, 182, 212, 0.2)",
                        boxShadow: "0 20px 60px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {/* Animated gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-teal-400/0 to-emerald-400/0 group-hover:from-cyan-400/10 group-hover:via-teal-400/10 group-hover:to-emerald-400/10 transition-all duration-500 rounded-3xl" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                      </div>

                      {/* Icon container with enhanced styling */}
                      <motion.div
                        className="relative inline-flex items-center justify-center rounded-2xl p-4 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 group-hover:from-cyan-500/30 group-hover:via-teal-500/30 group-hover:to-emerald-500/30 transition-all duration-500"
                        style={{
                          boxShadow: "0 8px 24px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                        }}
                        whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <service.icon className="w-8 h-8 text-cyan-700 group-hover:text-cyan-600 transition-colors duration-300 drop-shadow-sm" />
                        {/* Pulsing glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      </motion.div>

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-cyan-700 transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                            {service.desc}
                          </p>
                        </div>
                      </div>

                      {/* Decorative corner accent */}
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-cyan-400/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

      {/* Why Choose Us */}
      <motion.section 
        className="relative py-20 bg-gradient-to-b from-background via-slate-50/60 to-background dark:via-slate-900/40"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="container mx-auto px-4">
          <div className="rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.6)]">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6"
            >
              <p className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                Why riders trust Suja
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Modern electric mobility,
                <span className="block text-emerald-600 dark:text-emerald-400">
                  backed by real-world reliability.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                From engineering and testing to delivery and after‑sales support, every step
                is designed to feel premium, transparent, and worry‑free for our customers.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 max-w-xl text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Safety-first design</p>
                    <p>Robust chassis, braking, and battery protection tested for Indian roads.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Headphones className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">People-first support</p>
                    <p>Real humans on chat and phone to help you before and after purchase.</p>
                  </div>
                </div>
              </div>
            </motion.div>

              {/* Right: Feature cards */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              >
                <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    icon: Award,
                    title: "Premium Quality",
                    desc: "Each scooter is QC-checked across 100+ points and certified by leading labs.",
                  },
                  {
                    icon: Headphones,
                    title: "24/7 Support",
                    desc: "Round‑the‑clock assistance for breakdowns, service queries, and ownership help.",
                  },
                  {
                    icon: Shield,
                    title: "Secure Payments",
                    desc: "Trusted payment partners, easy EMIs, and clear pricing with no hidden fees.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: 0.08 * i, ease: "easeOut" }}
                    className="h-full"
                  >
                    <div className="h-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-6 flex flex-col gap-4">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
              </motion.div>
            </div>
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
