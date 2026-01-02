import { motion } from 'framer-motion';
import { ArrowRight, Battery, Shield, Headphones, Truck, Zap, Leaf, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ScooterCard } from './ScooterCard';
import { scooters } from './data/scooters';
import { StoreNavbar } from './StoreNavbar';

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
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Go Green, Go Electric</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-foreground">Ride the</span>
                <br />
                <span className="text-primary">Future</span>
                <br />
                <span className="text-foreground">Today</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                Experience the next generation of urban mobility with our premium electric scooters. 
                Zero emissions, maximum performance.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/scooters">
                  <Button size="lg" className="text-lg px-8 group">
                    Explore Scooters
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
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
                    <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent rounded-3xl blur-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
                  alt="Electric Scooter"
                  className="relative z-10 w-full rounded-3xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 bg-card/50 backdrop-blur border border-border/50 rounded-2xl hover:border-primary/50 transition-colors"
              >
                <div className="p-3 bg-primary/10 rounded-xl">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
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
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best electric mobility experience with cutting-edge technology and exceptional service
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: 'Premium Quality',
                desc: 'Every scooter undergoes rigorous quality checks and comes with industry-leading certifications.',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Our dedicated support team is always ready to help you with any queries or assistance.',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                desc: 'Multiple payment options including EMI plans starting from ₹2,999/month.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative p-8 bg-card/50 backdrop-blur border border-border/50 rounded-2xl text-center group hover:border-primary/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
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
                Join thousands of happy riders. Book your electric scooter today and get exclusive launch offers!
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

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">⚡ EVolta</h3>
              <p className="text-sm text-muted-foreground">
                Leading the electric mobility revolution with premium scooters and exceptional service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/scooters" className="block hover:text-primary">All Scooters</Link>
                <Link to="/login" className="block hover:text-primary">My Account</Link>
                <Link to="/" className="block hover:text-primary">Test Ride</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer">Contact Us</p>
                <p className="hover:text-primary cursor-pointer">FAQs</p>
                <p className="hover:text-primary cursor-pointer">Service Centers</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@evolta.com</p>
                <p>1800-123-4567 (Toll Free)</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2024 EVolta. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
