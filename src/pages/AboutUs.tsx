import { motion } from 'framer-motion';
import { Sparkles, Eye, Leaf, Heart, Users, Crosshair, Award, ArrowRight, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { FloatingPetals } from '@/components/FloatingPetals';

export function AboutUs() {
  const coreValues = [
    {
      icon: Crosshair,
      title: 'Innovation',
      desc: 'Modern manufacturing processes and innovative service models setting new standards in the EV industry',
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      desc: 'Zero pollution mobility with energy-efficient solutions for a cleaner environment',
    },
    {
      icon: Heart,
      title: 'Quality & Trust',
      desc: '43 years of business excellence with strong commitment to quality and customer satisfaction',
    },
    {
      icon: Users,
      title: 'Accessibility',
      desc: 'Affordable electric vehicles and sustainable income opportunities for everyone',
    },
  ];


  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <FloatingPetals count={35} />
      <StoreNavbar solidBackground />

      {/* Hero / Our Story Section - Driving the Future */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        {/* Left & right background gradient - teal/mint from sides fading to white in center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, #d4f1ef 0%, #e8f8f6 18%, #f5fcfb 28%, #ffffff 50%, #f5fcfb 72%, #e8f8f6 82%, #d4f1ef 100%)',
          }}
        />
        {/* Floating leaf / petal-like elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-16 left-[8%] w-12 h-16 rounded-full bg-teal-200/50 blur-[1px] rotate-[-25deg] scale-110" style={{ transform: 'rotate(-25deg) scale(1.1)' }} />
          <div className="absolute top-28 left-[5%] w-8 h-10 rounded-full bg-emerald-200/40 -rotate-12" />
          <div className="absolute top-48 left-[12%] w-14 h-9 rounded-full bg-cyan-200/45 rotate-[15deg]" />
          <div className="absolute top-20 right-[10%] w-10 h-14 rounded-full bg-teal-200/45 rotate-[20deg]" />
          <div className="absolute top-36 right-[6%] w-12 h-8 rounded-full bg-emerald-200/40 -rotate-[15deg]" />
          <div className="absolute top-56 right-[14%] w-9 h-12 rounded-full bg-cyan-200/35 rotate-[-20deg]" />
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-6 h-8 rounded-full bg-teal-100/60 rotate-12" />
          <div className="absolute top-14 right-[22%] w-7 h-9 rounded-full bg-emerald-100/50 -rotate-6" />
          <div className="absolute top-40 left-[22%] w-8 h-6 rounded-full bg-teal-100/55 rotate-[30deg]" />
        </div>
        <div className="absolute top-20 left-[15%] w-32 h-32 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-40 right-[20%] w-24 h-24 rounded-full bg-emerald-200/25 blur-2xl" />
        <div className="absolute bottom-20 left-[30%] w-40 h-40 rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto space-y-6 pb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-300/80 bg-teal-50/90 shadow-sm">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="inline-flex shrink-0"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" strokeWidth={2.25} />
              </motion.span>
              <span className="text-sm font-medium text-teal-700">Our Story</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#1a1a2e]">
              Driving the{' '}
              <span
                className="bg-clip-text text-transparent bg-[length:100%_100%]"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #f472b6 0%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Future
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              With 43 years of business excellence and trust, ZUJA began its journey in 1983 in Alappuzha, Kerala, marking its presence in the textile industry with a strong commitment to quality and customer satisfaction. Today, we're revolutionizing urban transportation with sustainable, stylish, and smart electric scooters.
            </p>
          </motion.div>

          {/* Hero image with overlays */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative max-w-6xl mx-auto -mt-2"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <img
                src="/download%20(1).png"
                alt="Electric scooter showroom - Zuja team"
                className="w-full h-[420px] sm:h-[480px] lg:h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              {/* Floor gradient / glow - blue-green band across bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-24 opacity-40 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,188,212,0.25) 30%, rgba(0,150,136,0.35) 50%, rgba(0,188,212,0.25) 70%, transparent 100%)',
                }}
              />

              {/* Overlay: 100K+ Happy Riders - bottom left */}
              <div
                className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 rounded-2xl px-5 py-4 shadow-lg text-white"
                style={{ backgroundColor: '#1e3a5f' }}
              >
                <div className="text-2xl sm:text-3xl font-bold">100K+</div>
                <div className="text-sm font-medium opacity-95">Happy Riders</div>
              </div>

              {/* Overlay: 25+ Countries - bottom right */}
              <div
                className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 rounded-2xl px-5 py-4 shadow-lg text-white"
                style={{ backgroundColor: '#0d5c4a' }}
              >
                <div className="text-2xl sm:text-3xl font-bold">25+</div>
                <div className="text-sm font-medium opacity-95">Countries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission - two columns with eye icons */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-white">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-sky-100/60 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.85, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-32 right-[5%] w-48 h-48 rounded-full bg-teal-100/50 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.75, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
            <motion.div
              className="w-full h-full rounded-full bg-emerald-50/40 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 max-w-6xl mx-auto items-start">
            {/* Our Vision */}
            <motion.div
              initial={{ opacity: 0, x: -40, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 p-6 sm:p-8 rounded-2xl relative group cursor-default"
              style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, transparent 50%)',
                  boxShadow: '0 20px 40px -15px rgba(6, 182, 212, 0.15)',
                }}
              />
              <div className="relative">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.08, rotate: 5, transition: { type: 'spring', stiffness: 400 } }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 200 }}
                    style={{
                      background: 'rgba(6, 182, 212, 0.12)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Eye className="w-6 h-6 text-[#0891b2]" />
                    </motion.div>
                  </motion.div>
                  <span className="text-lg font-bold text-[#0891b2]">Our Vision</span>
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] leading-tight mt-4">
                  <motion.span
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.2 }}
                  >
                    An Electric Scooter in{' '}
                  </motion.span>
                  <motion.span
                    className="vision-mission-highlight inline-block bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #ec4899 0%, #f472b6 25%, #fb7185 50%, #f472b6 75%, #ec4899 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Every Home
                  </motion.span>
                </h2>
                <motion.p
                  className="text-gray-600 leading-relaxed mt-2"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.45 }}
                >
                  ZUJA aims to bring electric scooters to every village in India, promoting clean energy, better health, and environmental responsibility. We envision a future where sustainable mobility is accessible to all, contributing to a healthier planet and better quality of life.
                </motion.p>
              </div>
            </motion.div>

            {/* Our Mission */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 p-6 sm:p-8 rounded-2xl relative group cursor-default"
              style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, transparent 50%)',
                  boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15)',
                }}
              />
              <div className="relative">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.08, rotate: -5, transition: { type: 'spring', stiffness: 400 } }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.25, type: 'spring', stiffness: 200 }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Crosshair className="w-6 h-6 text-pink-500" />
                    </motion.div>
                  </motion.div>
                  <span className="text-lg font-bold text-pink-500">Our Mission</span>
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] leading-tight mt-4">
                  <motion.span
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.25 }}
                  >
                    Delivering Excellence in{' '}
                  </motion.span>
                  <motion.span
                    className="vision-mission-highlight inline-block bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #db2777 0%, #ec4899 25%, #f472b6 50%, #ec4899 75%, #db2777 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Electric Mobility
                  </motion.span>
                </h2>
                <motion.p
                  className="text-gray-600 leading-relaxed mt-2"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.5 }}
                >
                  We are committed to delivering energy-efficient solutions, pollution-free mobility, affordable electric vehicles, and sustainable income opportunities. With modern manufacturing processes and innovative service models, we're setting new standards in the EV industry while manufacturing Indian-made lithium-ion batteries and electrical products.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Journey & Future Plans */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-b from-white to-[#f0fafb]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[15%] w-48 h-48 rounded-full bg-teal-100/40 blur-3xl" />
          <div className="absolute bottom-20 right-[15%] w-56 h-56 rounded-full bg-emerald-100/35 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-[#00B0A8] font-semibold text-sm sm:text-base mb-2">Our Journey</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a2e]">
              43 Years of{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #f472b6 0%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Excellence
              </span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-4">From Textile to Electric Mobility</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                ZUJA began its business journey in 1983 in Alappuzha, Kerala, marking its presence in the textile industry with a strong commitment to quality and customer satisfaction. With 43 years of business experience, the ZUJA brand has built a legacy of trust, reliability, and continuous growth.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Over the years, the company expanded its operations under ZUJA Enterprises, successfully launching and managing multiple business ventures across various sectors. As part of its forward-thinking approach, ZUJA Electric Scooters entered the electric vehicle segment as a distributor, addressing the increasing need for eco-friendly transportation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-4">Manufacturing Excellence</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                To strengthen innovation and manufacturing capabilities, ZUJA Electrical Innovation Private Limited was established, officially entering the electric scooter manufacturing and marketing sector. The company introduced modern manufacturing processes along with innovative service and marketing models, setting new standards in the EV industry.
              </p>
              <p className="text-gray-600 leading-relaxed">
                ZUJA focuses on the manufacture of Indian-made lithium-ion batteries and electrical products, with a long-term goal of becoming one of India's most trusted EV brands.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-teal-100"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-4">Looking Toward the Future</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Looking toward the future, ZUJA is preparing for global exports while expanding its domestic network. The company has initiated plans to establish showrooms, outlets, and service centers in every taluk across India, ensuring strong after-sales service and customer satisfaction.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-teal-700 border border-teal-200">
                  Global Exports
                </span>
                <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-teal-700 border border-teal-200">
                  Pan-India Network
                </span>
                <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-teal-700 border border-teal-200">
                  Service Excellence
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Core Values - What Drives Us */}
      <section className="relative py-20 sm:py-24 overflow-hidden" style={{ backgroundColor: '#f0fafb' }}>
        {/* Running border animation - rotating gradient */}
        <style>{`
          @keyframes coreValuesBorderRun {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @-webkit-keyframes coreValuesBorderRun {
            0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
          }
          .core-values-border-card {
            position: relative;
            background: white;
            border-radius: 1.5rem;
            overflow: hidden;
            isolation: isolate;
          }
          .core-values-border-card::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200%;
            height: 200%;
            margin-left: -100%;
            margin-top: -100%;
            background: conic-gradient(
              from 0deg,
              #f472b6 0deg,
              #fb7185 60deg,
              #f43f5e 120deg,
              #fb7185 180deg,
              #f472b6 240deg,
              #fb7185 300deg,
              #f472b6 360deg
            );
            animation: coreValuesBorderRun 3s linear infinite;
            -webkit-animation: coreValuesBorderRun 3s linear infinite;
            will-change: transform;
            -webkit-transform-origin: center center;
            transform-origin: center center;
          }
          .core-values-border-card::after {
            content: '';
            position: absolute;
            inset: 4px;
            background: white;
            border-radius: calc(1.5rem - 4px);
            z-index: 1;
          }
          .core-values-border-card .core-values-content {
            position: relative;
            z-index: 2;
          }
        `}</style>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 right-[15%] w-28 h-28 rounded-full bg-teal-200/30 blur-2xl" />
          <div className="absolute bottom-40 left-[10%] w-36 h-36 rounded-full bg-sky-200/25 blur-2xl" />
          <div className="absolute top-1/2 right-[20%] w-20 h-20 rounded-full bg-amber-100/40 blur-xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-[#00B0A8] font-semibold text-sm sm:text-base mb-2">What Drives Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a2e]">
              Our Core{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #f472b6 0%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Values
              </span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {coreValues.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <div className="core-values-border-card p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
                  <div className="core-values-content">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-teal-50 border border-teal-100/80 group-hover:bg-teal-100/50 transition-colors">
                      <item.icon className="w-7 h-7 text-[#00B0A8]" />
                    </div>
                    <h3 className="font-bold text-lg text-[#1a1a2e] mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Revolution CTA */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #00BCD4 0%, #26a69a 50%, #8BC34A 100%)',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Join the Revolution
            </h2>
            <p className="text-lg sm:text-xl text-white/90">
              Be part of the change. Experience the future of urban mobility today.
            </p>
            <div className="pt-4">
              <Link to="/scooters">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base font-semibold bg-white text-[#1a1a2e] hover:bg-gray-50 hover:!text-[#1a1a2e] shadow-lg hover:shadow-xl transition-all duration-300 border-0 [&_svg]:text-[#1a1a2e] [&_svg]:hover:text-[#1a1a2e]"
                  style={{ backgroundColor: 'white', color: '#1a1a2e' }}
                >
                  Explore Our Scooters
                  <ArrowRight className="ml-2 w-5 h-5 inline shrink-0" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-teal-100/40 blur-3xl" />
          <div className="absolute bottom-32 right-[5%] w-48 h-48 rounded-full bg-emerald-100/30 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-[#00B0A8] font-semibold text-sm sm:text-base mb-2">Get In Touch</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a2e]">
              Contact{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #f472b6 0%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Us
              </span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-sm text-gray-600">KUTTIYIDAYIL, ARRATTUVAZHY</p>
              <p className="text-sm text-gray-600">Alappuzha North, Ambalapuzh A</p>
              <p className="text-sm text-gray-600">Alappuzha- 688007, Kerala</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <a href="tel:7356360777" className="text-sm text-gray-600 hover:text-[#15adc1] transition-colors">
                7356360777
              </a>
              <p className="text-sm text-gray-500 mt-1">Customer Care</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <a href="mailto:zujaelectric@gmail.com" className="text-sm text-gray-600 hover:text-[#15adc1] transition-colors">
                zujaelectric@gmail.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Working Hours</h3>
              <p className="text-sm text-gray-600">Mon - Sat: 9AM - 8PM</p>
              <p className="text-sm text-gray-600">Sunday: Holiday</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
