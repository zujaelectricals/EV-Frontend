import { motion } from 'framer-motion';
import { Leaf, Zap, Award, Users, Target, Heart, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/components/Footer';

export function AboutUs() {
  const values = [
    {
      icon: Leaf,
      title: 'Sustainability First',
      desc: 'Committed to reducing carbon footprint and promoting eco-friendly transportation solutions.',
      gradientFrom: 'rgb(16, 185, 129)',
      gradientTo: 'rgb(5, 150, 105)',
    },
    {
      icon: Zap,
      title: 'Innovation Driven',
      desc: 'Constantly pushing boundaries with cutting-edge technology and smart mobility solutions.',
      gradientFrom: 'rgb(59, 130, 246)',
      gradientTo: 'rgb(37, 99, 235)',
    },
    {
      icon: Heart,
      title: 'Customer Centric',
      desc: 'Your satisfaction is our priority. We listen, adapt, and deliver exceptional experiences.',
      gradientFrom: 'rgb(236, 72, 153)',
      gradientTo: 'rgb(219, 39, 119)',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      desc: 'Rigorous testing and quality control ensure every product meets the highest standards.',
      gradientFrom: 'rgb(168, 85, 247)',
      gradientTo: 'rgb(147, 51, 234)',
    },
  ];

  const missionVision = [
    { 
      title: 'Our Mission', 
      desc: 'To promote sustainable transportation by offering affordable, reliable, and performance-driven electric scooters that reduce environmental impact and improve everyday commuting.' 
    },
    { 
      title: 'Our Vision', 
      desc: 'To become a trusted and premium electric scooter brand by setting benchmarks in quality, innovation, and customer satisfaction.' 
    },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Riders', icon: Users },
    { value: '200+', label: 'Service Centers', icon: Target },
    { value: '15+', label: 'Cities Covered', icon: TrendingUp },
    { value: '4.8★', label: 'Customer Rating', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar solidBackground />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-24">
        {/* Animated Background - Light Green Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-400/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-400/20 border border-emerald-300 dark:border-emerald-400/30 rounded-full">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">About Zuja</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="text-foreground">Ride The</span>
              <br />
              <span className="text-[#00C2B2]">Electric Wave</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of style, performance, and sustainability. Our electric scooters are designed for the modern urban explorer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">About Us</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Suja Electric Scooters is committed to delivering high-quality electric scooters that combine modern design, 
                  advanced technology, and long-term value. Each model is carefully tested to ensure safety, strength, and a 
                  smooth riding experience.
                </p>
                <p>
                  Experience the perfect blend of style, performance, and sustainability. Our electric scooters are designed for the modern urban explorer.
                </p>
                <p>
                  Easy EMI Available at very low interest rates, making electric scooters affordable for everyone.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50/50 to-white/30 backdrop-blur-sm p-8 border border-emerald-200/30 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop&q=80"
                  alt="Zuja Team"
                  className="w-full h-auto object-cover rounded-2xl"
                  style={{
                    filter: 'drop-shadow(0 25px 50px rgba(16, 185, 129, 0.3))',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-emerald-300/15 to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our mission and shape our culture
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl">
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
                    <div className="relative z-10">
                      <div
                        className="p-3 rounded-xl mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 inline-block"
                        style={{
                          background: `linear-gradient(135deg, ${value.gradientFrom}20, ${value.gradientTo}15)`,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: `0 4px 16px ${value.gradientFrom}30`,
                        }}
                      >
                        <value.icon className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 drop-shadow-sm">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The guiding principles that drive our commitment to excellence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {missionVision.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card/50 border border-border rounded-2xl p-8 backdrop-blur-sm h-full">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-blue-50/30 to-purple-50/50 dark:from-emerald-950/20 dark:via-blue-950/10 dark:to-purple-950/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-400/20 mb-4">
                  <stat.icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div 
                  className="text-4xl font-bold bg-gradient-to-r from-[#00BCD4] to-[#00E676] bg-clip-text text-transparent mb-2"
                >
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 border border-emerald-300/30 p-12 lg:p-16"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Ride The </span>
                <span className="text-[#00C2B2]">Electric Wave</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Be part of a sustainable future. Explore our scooters or get in touch to learn more.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/scooters" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-white border-none rounded-full px-8 py-6 group"
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
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-white border-none rounded-full px-8 py-6 group"
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
                    Contact Us
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

