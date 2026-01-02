import { motion } from 'framer-motion';
import { ArrowRight, Battery, Shield, Headphones, Truck, Zap, Leaf, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ScooterCard } from './ScooterCard';
import { scooters } from './data/scooters';
import { StoreNavbar } from './StoreNavbar';
import { Footer } from '@/components/Footer';

export function HomePage() {
  const featuredScooters = scooters.filter(s => s.isBestseller || s.isNew).slice(0, 4);

  const benefits = [
    { icon: Battery, title: 'Extended Range', desc: 'Up to 200km on single charge' },
    { icon: Zap, title: 'Fast Charging', desc: '0-80% in just 45 minutes' },
    { icon: Shield, title: '5 Year Warranty', desc: 'Comprehensive coverage' },
    { icon: Truck, title: 'Free Delivery', desc: 'Doorstep delivery pan-India' },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Riders' },
    { value: '200+', label: 'Service Centers' },
    { value: '15+', label: 'Cities Covered' },
    { value: '4.8★', label: 'Customer Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background - Light Green Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-400/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-400/20 border border-emerald-300 dark:border-emerald-400/30 rounded-full">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Go Green, Go Electric</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-foreground">Driving a Smarter,</span>
                <br />
                <span className="text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">Cleaner Electric Future</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                Established in 2025, Suja Electric Scooters represents a new standard in electric mobility. 
                Our scooters are thoughtfully engineered for superior performance, durability, and everyday reliability, 
                perfectly suited for Indian road conditions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/scooters">
                  <Button size="lg" className="text-lg px-8 bg-emerald-600 hover:bg-emerald-700 text-white group">
                    Explore Scooters
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-emerald-300 dark:border-emerald-400/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-400/10">
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
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center h-full"
            >
              {/* Futuristic EV Motorcycle Image */}
              <div className="relative w-full max-w-3xl">
                {/* Glowing effect behind the bike */}
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl -z-0 animate-pulse" style={{ transform: 'scale(1.2)' }} />
                
                {/* Image container with rounded corners */}
                <div className="relative z-10 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50/50 to-white/30 backdrop-blur-sm p-8 border border-emerald-200/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&h=800&fit=crop&q=80"
                    alt="Futuristic Electric Motorcycle"
                    className="w-full h-auto object-contain rounded-2xl"
                    style={{ 
                      filter: 'drop-shadow(0 25px 50px rgba(16, 185, 129, 0.3))',
                    }}
                    onError={(e) => {
                      // Fallback to another futuristic EV motorcycle image
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&h=800&fit=crop&q=80';
                    }}
                  />
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
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/8 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                {/* Liquid Glass Effect Card - iOS Style */}
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Glass background with iOS-style liquid glass effect */}
                  <div 
                    className="relative p-6 backdrop-blur-2xl rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
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
                          background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.3) 0%, rgba(74, 222, 128, 0.2) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 16px rgba(134, 239, 172, 0.2)',
                        }}
                      >
                        <benefit.icon className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 drop-shadow-sm">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Key Features</h2>
              <div className="space-y-4">
                {[
                  'High-efficiency electric motors',
                  'Long-lasting lithium battery technology',
                  'Reinforced suspension and braking systems',
                  'Digital dashboard and smart features',
                  'Silent, zero-emission operation',
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-emerald-300 dark:hover:border-emerald-400/50 transition-colors"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0" />
                    <p className="text-muted-foreground">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Our Services */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Services</h2>
              <div className="space-y-4">
                {[
                  'Electric scooter sales',
                  'Easy EMI and finance assistance',
                  'After-sales service and maintenance',
                  'Genuine spare parts support',
                  'Test rides and customer guidance',
                ].map((service, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-emerald-300 dark:hover:border-emerald-400/50 transition-colors"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0" />
                    <p className="text-muted-foreground">{service}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Scooters */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Featured Scooters</h2>
              <p className="text-muted-foreground">Discover our most popular electric rides</p>
            </div>
            <Link to="/scooters" className="hidden md:flex items-center gap-2 text-primary hover:underline">
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
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-purple-50/50 dark:from-emerald-950/20 dark:via-blue-950/10 dark:to-purple-950/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl" />
        </div>

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
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose Us
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              We're committed to providing the best electric mobility experience with cutting-edge technology and exceptional service
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: Award,
                title: 'Premium Quality',
                desc: 'Every scooter undergoes rigorous quality checks and comes with industry-leading certifications.',
                gradientFrom: 'rgb(16, 185, 129)',
                gradientTo: 'rgb(5, 150, 105)',
                bgGradientFrom: 'rgba(209, 250, 229, 0.5)',
                bgGradientTo: 'rgba(167, 243, 208, 0.3)',
                darkBgGradientFrom: 'rgba(6, 78, 59, 0.3)',
                darkBgGradientTo: 'rgba(2, 44, 34, 0.2)',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Our dedicated support team is always ready to help you with any queries or assistance.',
                gradientFrom: 'rgb(59, 130, 246)',
                gradientTo: 'rgb(37, 99, 235)',
                bgGradientFrom: 'rgba(219, 234, 254, 0.5)',
                bgGradientTo: 'rgba(191, 219, 254, 0.3)',
                darkBgGradientFrom: 'rgba(30, 58, 138, 0.3)',
                darkBgGradientTo: 'rgba(23, 37, 84, 0.2)',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                desc: 'Multiple payment options including EMI plans starting from ₹2,999/month.',
                gradientFrom: 'rgb(168, 85, 247)',
                gradientTo: 'rgb(147, 51, 234)',
                bgGradientFrom: 'rgba(243, 232, 255, 0.5)',
                bgGradientTo: 'rgba(233, 213, 255, 0.3)',
                darkBgGradientFrom: 'rgba(88, 28, 135, 0.3)',
                darkBgGradientTo: 'rgba(59, 7, 100, 0.2)',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative group"
              >
                {/* Card Container with Glassmorphism */}
                <motion.div 
                  className="relative h-full p-8 lg:p-10 rounded-3xl overflow-hidden
                    backdrop-blur-xl border border-white/20 dark:border-white/10
                    shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${item.bgGradientFrom}, ${item.bgGradientTo})`,
                    boxShadow: `
                      0 10px 40px -10px rgba(0, 0, 0, 0.1),
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.2)
                    `,
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: `
                      0 20px 60px -10px rgba(0, 0, 0, 0.15),
                      0 0 0 1px rgba(255, 255, 255, 0.2),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.3)
                    `,
                    transition: { duration: 0.3, ease: "easeOut" }
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
                    whileHover={{ opacity: 0.08 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full" />
                  </motion.div>

                  {/* Glow Effect on Hover */}
                  <motion.div
                    className="absolute -inset-1 rounded-3xl -z-10 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ opacity: 0.3, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Icon Container with Animation */}
                    <div className="inline-flex mb-6">
                      <motion.div 
                        className="relative p-5 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                          boxShadow: `0 8px 24px -4px ${item.gradientFrom}40`,
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 3, -3, 0],
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut"
                          }}
                        >
                          <item.icon className="w-10 h-10 text-white drop-shadow-lg" />
                        </motion.div>
                        
                        {/* Pulse Ring */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-white/40"
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Title with Animation */}
                    <div className="relative mb-4 h-[2.5rem] flex items-center justify-center">
                      <h3 
                        className="text-2xl font-bold text-foreground transition-all duration-300 group-hover:opacity-0 group-hover:scale-105"
                      >
                        {item.title}
                      </h3>
                      <h3 
                        className="text-2xl font-bold absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {item.desc}
                    </p>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors duration-500 pointer-events-none" />
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 p-12 lg:p-16"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ready to Go Electric?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Easy EMI Available at very low interest rates, making electric scooters affordable for everyone. 
                Join thousands of happy riders and experience the future of mobility today!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/scooters">
                  <Button size="lg" className="text-lg px-8">
                    Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
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
