import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">Suja Electric</h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              Driving a Smarter, Cleaner Electric Future. Established in 2025, delivering high-quality electric scooters with modern design and advanced technology.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/scooters" className="block hover:text-primary transition-colors">All Scooters</Link>
              <Link to="/about" className="block hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="block hover:text-primary transition-colors">Contact</Link>
              <Link to="/login" className="block hover:text-primary transition-colors">My Account</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/contact" className="block hover:text-primary transition-colors">Contact Us</Link>
              <p className="hover:text-primary cursor-pointer transition-colors">FAQs</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Service Centers</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="mailto:Zujaelectricscooters@gmail.com" className="block hover:text-primary transition-colors">
                Zujaelectricscooters@gmail.com
              </a>
              <a href="tel:7356360777" className="block hover:text-primary transition-colors">
                7356360777
              </a>
              <a href="tel:7736528688" className="block hover:text-primary transition-colors">
                7736528688
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © 2025 Suja Electric Scooters. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

