import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {

  return (
    <footer className="py-12 border-t border-border/50" style={{ backgroundColor: '#f8f8fa' }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Zuja Electric" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              Leading the electric mobility revolution with innovative, eco-friendly scooters designed for the modern urban commuter.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, name: "Facebook", href: "#" },
                { Icon: Instagram, name: "Instagram", href: "#" },
                { Icon: Twitter, name: "Twitter", href: "#" },
                { Icon: Youtube, name: "YouTube", href: "#" },
              ].map((social, i) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  {/* Circular background with gradient effect */}
                  <div
                    className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(167, 243, 208, 0.4) 0%, rgba(153, 246, 228, 0.3) 50%, rgba(134, 239, 172, 0.25) 100%)',
                    }}
                  >
                    <social.Icon 
                      className="w-5 h-5 transition-colors duration-300 relative z-10" 
                      style={{ color: '#15adc1' }}
                    />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/scooters" className="block transition-colors hover:text-[#15adc1]">All Scooters</Link>
              <Link to="/about" className="block transition-colors hover:text-[#15adc1]">About Us</Link>
              <Link to="/gallery" className="block transition-colors hover:text-[#15adc1]">Gallery</Link>
              <Link to="/contact" className="block transition-colors hover:text-[#15adc1]">Contact</Link>
              <Link to="/login" className="block transition-colors hover:text-[#15adc1]">My Account</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/contact" className="block transition-colors hover:text-[#15adc1]">Contact Us</Link>
              <p className="cursor-pointer transition-colors hover:text-[#15adc1]">FAQs</p>
              <p className="cursor-pointer transition-colors hover:text-[#15adc1]">Service Centers</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a 
                href="mailto:zujaelectric@gmail.com" 
                className="flex items-center gap-3 transition-colors group hover:text-[#15adc1]"
              >
                <Mail className="w-5 h-5 transition-colors duration-300" style={{ color: '#15adc1' }} />
                <span>zujaelectric@gmail.com</span>
              </a>
              <a 
                href="tel:7356360777" 
                className="flex items-center gap-3 transition-colors group hover:text-[#15adc1]"
              >
                <Phone className="w-5 h-5 transition-colors duration-300" style={{ color: '#15adc1' }} />
                <span>7356360777</span>
              </a>
              {/* <a 
                href="tel:7736528688" 
                className="flex items-center gap-3 transition-colors group hover:text-[#15adc1]"
              >
                <Phone className="w-5 h-5 transition-colors duration-300" style={{ color: '#15adc1' }} />
                <span>7736528688</span>
              </a> */}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            © 2025 Suja Electric Scooters. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="transition-colors hover:text-[#15adc1]">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="transition-colors hover:text-[#15adc1]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


