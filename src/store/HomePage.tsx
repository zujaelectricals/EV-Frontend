import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScooterCard } from "./ScooterCard";
import { StoreNavbar } from "./StoreNavbar";
import { Footer } from "@/components/Footer";
import { useGetVehiclesQuery } from "@/app/api/inventoryApi";
import { mapVehicleGroupsToScooters } from "./utils/vehicleMapper";

// HomePage component
export function HomePage() {
  // Scroll to top on mount to prevent stutter - use requestAnimationFrame for smoother transition
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  // Fetch featured vehicles from API (limit to 4, status available)
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

  const stats = [
    { value: "50K+", label: "Happy Riders" },
    { value: "200+", label: "Service Centers" },
    { value: "15+", label: "Cities Covered" },
    { value: "4.8★", label: "Customer Rating" },
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

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            src="/Banner_videos/video2.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Soft gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-emerald-100/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-400/20 border border-emerald-300 dark:border-emerald-400/30 rounded-full">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  Go Green, Go Electric
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-foreground">Driving a Smarter,</span>
                <br />
                <span className="text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                  Cleaner Electric Future
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-lg">
                Established in 2025, Suja Electric Scooters represents a new
                standard in electric mobility. Our scooters are thoughtfully
                engineered for superior performance, durability, and everyday
                reliability, perfectly suited for Indian road conditions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/scooters">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white group"
                  >
                    Explore Scooters
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-emerald-300 dark:border-emerald-400/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-400/10"
                  >
                    Book a Test Ride
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
                    <div className="text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="relative hidden lg:flex items-center justify-center h-full"
            >
              {/* Futuristic EV Motorcycle Image */}
              <div className="relative w-full max-w-3xl">
                {/* Glowing effect behind the bike */}
                <div
                  className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl -z-0 animate-pulse"
                  style={{ transform: "scale(1.2)" }}
                />

                {/* Image container with rounded corners */}
                <div className="relative z-10 rounded-3xl bg-gradient-to-br from-emerald-50/50 to-white/30 backdrop-blur-sm animate-floating-shadow">
                  <div className="rounded-3xl overflow-hidden">
                    <img
                      src="/banner.jpg"
                      alt="Electric Scooter"
                      className="w-full h-auto object-cover rounded-3xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-20 overflow-hidden">
        {/* Rich background with gradient and animated elements - Light Green Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-emerald-300/15 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/8 rounded-full blur-3xl" />
        </div>

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
      </section>

      {/* Key Features & Services */}
      <section
        ref={featuresSectionRef}
        className="relative overflow-hidden"
        style={{
          minHeight: "115vh",
          paddingTop: "3rem",
          paddingBottom: "3rem",
        }}
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

        {/* Overlay gradient for readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(135deg, rgba(209, 250, 229, 0.75) 0%, rgba(255, 255, 255, 0.80) 50%, rgba(209, 250, 229, 0.75) 100%)",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Static Background decorative elements */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"
            style={{
              y: backgroundY1,
              transform: "translateZ(0)",
            }}
            transition={{ type: "spring", stiffness: 50, damping: 30 }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl"
            style={{
              y: backgroundY2,
              transform: "translateZ(0)",
            }}
            transition={{ type: "spring", stiffness: 50, damping: 30 }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="w-full max-w-7xl mx-auto py-8 sm:py-12">
            {/* Key Features */}
            <div className="mb-16 sm:mb-24">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-10 text-center"
                style={{
                  y: featuresTitleY,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                Key Features
              </motion.h2>
              <div className="grid gap-14 sm:gap-20 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="group relative h-full mx-3 lg:mx-4"
                  >
                    <div
                      className="relative h-full w-full rounded-2xl p-6 sm:p-7 flex flex-col items-start justify-between gap-5 backdrop-blur-xl shadow-lg transition-transform duration-300 group-hover:-translate-y-1 min-h-[270px] sm:min-h-[300px]"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,250,0.9) 100%)",
                        border: "1px solid rgba(148, 163, 184, 0.4)",
                      }}
                    >
                      <div className="inline-flex items-center justify-center rounded-xl p-3.5 bg-emerald-500/10 text-emerald-700">
                        <feature.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Our Services */}
            <div className="mt-12 sm:mt-16">
              <motion.h2
                className="relative z-20 text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-10 text-center"
                style={{
                  y: servicesTitleY,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                Our Services
              </motion.h2>
              <div className="grid gap-10 sm:gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="group relative h-full"
                  >
                    <div
                      className="relative h-full w-full rounded-2xl p-7 sm:p-8 flex flex-col items-start justify-between gap-5 backdrop-blur-xl shadow-lg transition-transform duration-300 group-hover:-translate-y-1 min-h-[260px] sm:min-h-[280px]"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(240,253,250,1) 100%)",
                        border: "1px solid rgba(148, 163, 184, 0.4)",
                      }}
                    >
                      <div className="inline-flex items-center justify-center rounded-xl p-3 bg-emerald-500/10 text-emerald-700">
                        <service.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scooters */}
      <section className="py-20">
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
      </section>

      {/* Why Choose Us */}
      <section className="relative py-20 bg-gradient-to-b from-background via-slate-50/60 to-background dark:via-slate-900/40">
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
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-50 via-emerald-25 to-emerald-100/70 dark:from-emerald-900/40 dark:via-emerald-900/20 dark:to-emerald-800/40 border border-emerald-200/70 dark:border-emerald-700 px-6 py-12 sm:px-10 sm:py-14 lg:px-20 lg:py-16"
          >
            {/* soft radial highlight */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18),_transparent_65%)]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Ready to Go Electric?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-200/80 max-w-3xl mx-auto">
                Easy EMI available at very low interest rates, making electric scooters
                affordable for everyone. Join thousands of happy riders and experience the
                future of mobility today.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link to="/scooters">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_18px_40px_rgba(16,185,129,0.45)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.55)] transition-shadow duration-200"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-emerald-500/60 text-emerald-700 dark:text-emerald-300 dark:border-emerald-500/70 bg-white/80 dark:bg-slate-900/60 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40"
                  >
                    Become a Distributor
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
