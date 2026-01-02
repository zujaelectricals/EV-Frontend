import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, User, Mail as MailIcon } from 'lucide-react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Footer } from '@/components/Footer';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Message Sent!', {
        description: 'Thank you for contacting us. We\'ll get back to you soon.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'Zujaelectricscooters@gmail.com',
      link: 'mailto:Zujaelectricscooters@gmail.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '7356360777, 7736528688',
      link: 'tel:7356360777',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Electric Avenue, Tech City, India 560001',
      link: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden pt-24">
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
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-400/20 border border-emerald-300 dark:border-emerald-400/30 rounded-full">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Get in Touch</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="text-foreground">Contact</span>
              <br />
              <span className="text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Us
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info, i) => (
                <motion.a
                  key={i}
                  href={info.link}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="block group"
                >
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
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.3) 0%, rgba(74, 222, 128, 0.2) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 16px rgba(134, 239, 172, 0.2)',
                        }}
                      >
                        <info.icon className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 drop-shadow-sm">{info.title}</h3>
                        <p className="text-sm text-muted-foreground">{info.content}</p>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div
                  className="relative p-8 lg:p-12 backdrop-blur-2xl rounded-3xl"
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
                  <h2 className="text-3xl font-bold text-foreground mb-6">Send us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-10 border-emerald-200 dark:border-emerald-400/30 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10 border-emerald-200 dark:border-emerald-400/30 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10 border-emerald-200 dark:border-emerald-400/30 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-foreground">
                          Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="border-emerald-200 dark:border-emerald-400/30 focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-foreground">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="border-emerald-200 dark:border-emerald-400/30 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border"
          >
            <div className="bg-gradient-to-br from-emerald-100/50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-900/10 h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Map integration can be added here</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

