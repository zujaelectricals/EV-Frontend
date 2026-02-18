import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Footer } from '@/components/Footer';
import { FloatingPetals } from '@/components/FloatingPetals';

export function Contact() {

  const contactCards = [
    {
      icon: MapPin,
      title: 'Visit Us',
      lines: ['KUTTIYIDAYIL, ARRATTUVAZHY', 'Alappuzha North, Ambalapuzh A', 'Alappuzha- 688007, Kerala'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      lines: ['7356360777', 'Customer Care'],
    },
    {
      icon: Mail,
      title: 'Email Us',
      lines: ['zujaelectric@gmail.com'],
    },
    {
      icon: Clock,
      title: 'Working Hours',
      lines: ['Mon - Sat: 9AM - 8PM', 'Sunday: Holiday'],
    },
  ];

  const quickAnswers = [
    'What is the warranty period?',
    'Do you offer financing options?',
    'Where can I get service?',
    'Can I trade in my old scooter?',
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Floating Petals Animation */}
      <FloatingPetals count={35} />
      
      <StoreNavbar solidBackground />

      {/* Hero Section - "Let's Start a Conversation" */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Curved gradient background - positioned below navbar */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 140% 70% at 50% 0%, rgba(153, 246, 228, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 100% 60% at 20% 5%, rgba(167, 243, 208, 0.4) 0%, transparent 45%),
              radial-gradient(ellipse 80% 50% at 85% 0%, rgba(94, 234, 212, 0.35) 0%, transparent 40%),
              radial-gradient(ellipse 60% 40% at 50% 20%, rgba(204, 251, 241, 0.3) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Additional soft gradient overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(240, 253, 250, 0.6) 0%, rgba(255, 255, 255, 0) 60%)`,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            {/* Get In Touch Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Get In Touch</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900">
              Let's Start a
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, #15b0bb 0%, #16bf9b 100%)',
                }}
              >
                Conversation
              </span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards - 4 in a row */}
      <section className="py-12 relative overflow-hidden">
        {/* CSS for animated border */}
        <style>{`
          @keyframes borderRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animated-border-card {
            position: relative;
            background: white;
            border-radius: 1rem;
            overflow: hidden;
          }
          .animated-border-card::before {
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
            animation: borderRotate 4s linear infinite;
            opacity: 1;
          }
          .animated-border-card::after {
            content: '';
            position: absolute;
            inset: 2px;
            background: white;
            border-radius: calc(1rem - 2px);
            z-index: 1;
          }
          .animated-border-card .card-content {
            position: relative;
            z-index: 2;
          }
        `}</style>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <div
                  className="animated-border-card p-6 transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="card-content">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      }}
                    >
                      <card.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>

                    {/* Content lines */}
                    {card.lines.map((line, idx) => (
                      <p key={idx} className="text-sm text-gray-500">{line}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section - Sidebar */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Our Showroom Card */}
              <div
                className="relative p-8 rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #e0f7f5 0%, #b2f0e8 30%, #a7f3d0 60%, #99f6e4 100%)',
                }}
              >
                {/* Decorative circles - matching first image style */}
                <div className="absolute top-6 left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(153, 246, 228, 0.5)' }} />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: 'rgba(167, 243, 208, 0.4)' }} />
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.3)' }} />
                <div className="absolute bottom-12 right-8 w-16 h-16 rounded-full" style={{ background: 'rgba(94, 234, 212, 0.4)' }} />
                <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full" style={{ background: '#d97706' }} />
                <div className="absolute bottom-6 left-1/2 w-2 h-2 rounded-full" style={{ background: 'rgba(20, 184, 166, 0.5)' }} />

                <div className="relative z-10 text-center py-8">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                    }}
                  >
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Our Showroom</h3>
                  <p className="text-gray-600">KUTTIYIDAYIL, ARRATTUVAZHY</p>
                  <p className="text-gray-600">Alappuzha North, Ambalapuzh A</p>
                  <p className="text-gray-600">Alappuzha- 688007, Kerala</p>
                </div>
              </div>

              {/* Quick Answers Card */}
              <div
                className="relative p-6 rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10" />
                <div className="absolute bottom-4 right-8 w-6 h-6 rounded-full bg-orange-400/60" />

                <h3 className="text-xl font-bold text-white mb-4">Quick Answers</h3>
                <div className="space-y-3">
                  {quickAnswers.map((question, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-white/90 flex-shrink-0" />
                      <span className="text-white/90 text-sm">{question}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Need Urgent Help Card */}
              <div
                className="relative p-5 rounded-2xl flex items-center gap-4"
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  border: '1px solid #fed7aa',
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  }}
                >
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Need Urgent Help?</h4>
                  <p className="text-sm text-gray-600">
                    Call our customer care:{' '}
                    <a href="tel:7356360777" className="text-teal-600 font-medium hover:underline">
                      7356360777
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

