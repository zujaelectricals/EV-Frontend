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
import { scooters } from "./data/scooters";
import { StoreNavbar } from "./StoreNavbar";
import { Footer } from "@/components/Footer";

// HomePage component
export function HomePage() {
  // Scroll to top on mount to prevent stutter - use requestAnimationFrame for smoother transition
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  const featuredScooters = scooters
    .filter((s) => s.isBestseller || s.isNew)
    .slice(0, 4);

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
    "High-efficiency electric motors",
    "Long-lasting lithium battery technology",
    "Reinforced suspension and braking systems",
    "Digital dashboard and smart features",
    "Silent, zero-emission operation",
  ];

  const services = [
    "Electric scooter sales",
    "Easy EMI and finance assistance",
    "After-sales service and maintenance",
    "Genuine spare parts support",
    "Test rides and customer guidance",
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
        {/* Dot Pattern Background - Radial Spokes with Concentric Rings */}
        <div className="absolute inset-0 bg-white dark:bg-background overflow-hidden">
          <style>{`
            @keyframes dotFloat {
              0%, 100% {
                transform: translate(0, 0);
              }
              25% {
                transform: translate(4px, -4px);
              }
              50% {
                transform: translate(-3px, 3px);
              }
              75% {
                transform: translate(3px, 4px);
              }
            }
            .dot-animated {
              animation: dotFloat 8s ease-in-out infinite;
              transform-origin: center;
            }
          `}</style>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            style={{ opacity: 0.4 }}
          >
            <defs>
              {/* Radial gradient for circular void in center */}
              <radialGradient id="center-void" cx="500" cy="500" r="500">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="8%" stopColor="white" stopOpacity="1" />
                <stop offset="10%" stopColor="white" stopOpacity="0.98" />
                <stop offset="12%" stopColor="white" stopOpacity="0.9" />
                <stop offset="15%" stopColor="white" stopOpacity="0.6" />
                <stop offset="20%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g transform="translate(500, 500)">
              {/* Create radial spokes with dots arranged in concentric rings */}
              {Array.from({ length: 40 }).map((_, rayIndex) => {
                const angle = (rayIndex * 360) / 40;

                return (
                  <g key={rayIndex} transform={`rotate(${angle})`}>
                    {/* Create dots along each radial line with increasing size */}
                    {Array.from({ length: 28 }).map((_, dotIndex) => {
                      // Start from center void edge (about 80px from center)
                      const startRadius = 80;
                      const radius = startRadius + dotIndex * 25;
                      // Dot size increases with distance from center: 0.8px to 4px
                      const dotSize = 0.8 + dotIndex * 0.12;
                      // Opacity decreases as we go outward: starts at 0.7, decreases to 0.2
                      const maxDots = 28;
                      const opacity = 0.7 - (dotIndex / maxDots) * 0.5;
                      // Animation delay based on position for wave effect
                      const animationDelay = rayIndex * 0.2 + dotIndex * 0.1;

                      return (
                        <circle
                          key={dotIndex}
                          cx={radius}
                          cy="0"
                          r={dotSize}
                          fill="#9ca3af"
                          opacity={opacity}
                          className="dot-animated"
                          style={{
                            animationDelay: `${animationDelay}s`,
                            animationDuration: `${6 + dotIndex * 0.15}s`,
                          }}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>

            {/* Radial fade to create circular void in center */}
            <rect width="1000" height="1000" fill="url(#center-void)" />
          </svg>
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
          minHeight: "150vh", // Reduced height for better scroll control
          paddingTop: "4rem",
          paddingBottom: "4rem",
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

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto py-8 sm:py-12">
            {/* Key Features */}
            <div className="mb-16 sm:mb-24">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8"
                style={{
                  y: featuresTitleY,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                Key Features
              </motion.h2>
              <div className="space-y-4 sm:space-y-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    style={{
                      y: featureTransforms[i].y,
                    }}
                    className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-white/80 dark:bg-card/80 border-2 border-gray-300/70 dark:border-gray-500/50 hover:border-gray-400 dark:hover:border-gray-400 transition-all duration-300 ease-out backdrop-blur-sm shadow-sm hover:shadow-lg transform-gpu"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0" />
                    <p className="text-muted-foreground text-base">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Our Services */}
            <div>
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8"
                style={{
                  y: servicesTitleY,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                Our Services
              </motion.h2>
              <div className="flex flex-col gap-4 sm:gap-6">
                {services.map((service, i) => (
                  <motion.div
                    key={i}
                    style={{
                      y: serviceTransforms[i].y,
                    }}
                    className="flex items-center gap-3 p-4 sm:p-5 rounded-xl bg-white/80 dark:bg-card/80 border-2 border-gray-300/70 dark:border-gray-500/50 hover:border-gray-400 dark:hover:border-gray-400 transition-all duration-300 ease-out backdrop-blur-sm shadow-sm hover:shadow-lg transform-gpu"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0" />
                    <p className="text-muted-foreground text-base flex-1">{service}</p>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredScooters.map((scooter, i) => (
              <ScooterCard key={scooter.id} scooter={scooter} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/scooters">
              <Button variant="outline">View All Scooters</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                Why Choose Us
              </motion.h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              We're committed to providing the best electric mobility experience
              with cutting-edge technology and exceptional service
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: Award,
                title: "Premium Quality",
                desc: "Every scooter undergoes rigorous quality checks and comes with industry-leading certifications.",
                gradientFrom: "rgb(16, 185, 129)",
                gradientTo: "rgb(5, 150, 105)",
                bgGradientFrom: "rgba(209, 250, 229, 0.6)",
                bgGradientTo: "rgba(167, 243, 208, 0.4)",
                darkBgGradientFrom: "rgba(6, 78, 59, 0.4)",
                darkBgGradientTo: "rgba(2, 44, 34, 0.3)",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                desc: "Our dedicated support team is always ready to help you with any queries or assistance.",
                gradientFrom: "rgb(20, 184, 166)",
                gradientTo: "rgb(13, 148, 136)",
                bgGradientFrom: "rgba(204, 251, 241, 0.6)",
                bgGradientTo: "rgba(153, 246, 228, 0.4)",
                darkBgGradientFrom: "rgba(17, 94, 89, 0.4)",
                darkBgGradientTo: "rgba(13, 71, 67, 0.3)",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Multiple payment options including EMI plans starting from ₹2,999/month.",
                gradientFrom: "rgb(34, 197, 94)",
                gradientTo: "rgb(22, 163, 74)",
                bgGradientFrom: "rgba(220, 252, 231, 0.6)",
                bgGradientTo: "rgba(187, 247, 208, 0.4)",
                darkBgGradientFrom: "rgba(20, 83, 45, 0.4)",
                darkBgGradientTo: "rgba(15, 60, 33, 0.3)",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                className="relative group"
              >
                {/* Card Container with Glassmorphism */}
                <motion.div
                  className="relative h-full p-8 lg:p-10 rounded-3xl overflow-hidden
                    backdrop-blur-xl border border-emerald-200/30 dark:border-emerald-400/20
                    shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${item.bgGradientFrom}, ${item.bgGradientTo})`,
                    boxShadow: `
                      0 10px 40px -10px rgba(16, 185, 129, 0.15),
                      0 0 0 1px rgba(255, 255, 255, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.3)
                    `,
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    boxShadow: `
                      0 25px 70px -10px rgba(16, 185, 129, 0.25),
                      0 0 0 1px rgba(255, 255, 255, 0.3),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.4)
                    `,
                    transition: { duration: 0.4, ease: "easeOut" },
                  }}
                >
                  {/* Dark mode background overlay */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 dark:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${item.darkBgGradientFrom}, ${item.darkBgGradientTo})`,
                    }}
                  />

                  {/* Animated Background Gradient on Hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                    }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Floating particles animation */}
                  <motion.div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(3)].map((_, idx) => (
                      <motion.div
                        key={idx}
                        className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
                        style={{
                          left: `${20 + idx * 30}%`,
                          top: `${30 + idx * 20}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 3 + idx,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: idx * 0.5,
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full" />
                  </motion.div>

                  {/* Glow Effect on Hover */}
                  <motion.div
                    className="absolute -inset-1 rounded-3xl -z-10 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ opacity: 0.4, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Icon Container with Animation */}
                    <div className="inline-flex mb-6">
                      <motion.div
                        className="relative p-5 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                          boxShadow: `0 8px 24px -4px ${item.gradientFrom}50`,
                        }}
                        whileHover={{
                          scale: 1.15,
                          rotate: [0, -5, 5, -5, 0],
                          transition: { duration: 0.5 },
                        }}
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          y: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2,
                          },
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut",
                          }}
                        >
                          <item.icon className="w-10 h-10 text-white drop-shadow-lg" />
                        </motion.div>

                        {/* Pulse Ring */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-white/50"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Title with Animation */}
                    <motion.div
                      className="relative mb-4 h-[2.5rem] flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.3 }}
                    >
                      <h3 className="text-2xl font-bold text-foreground transition-all duration-300">
                        {item.title}
                      </h3>
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      className="text-muted-foreground leading-relaxed text-base"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.4 }}
                    >
                      {item.desc}
                    </motion.p>

                    {/* Decorative Elements */}
                    <motion.div
                      className="absolute top-4 right-4 w-20 h-20 bg-emerald-300/10 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    />
                    <motion.div
                      className="absolute bottom-4 left-4 w-16 h-16 bg-teal-300/10 rounded-full blur-xl"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4,
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-400/20 via-emerald-300/10 to-emerald-400/20 border border-emerald-300/30 p-12 lg:p-16"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ready to Go Electric?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Easy EMI Available at very low interest rates, making electric
                scooters affordable for everyone. Join thousands of happy riders
                and experience the future of mobility today!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/scooters">
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
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
