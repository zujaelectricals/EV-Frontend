import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Footer } from '@/components/Footer';
import { FloatingPetals } from '@/components/FloatingPetals';
import { API_BASE_URL } from '@/lib/config';

interface GalleryItem {
  id: number;
  title: string;
  image: string;
  image_url: string;
  caption: string;
  level: string;
  level_display: string;
  order: number;
  status: boolean;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

interface GalleryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryItem[];
}

export function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}gallery/gallery-items/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch gallery items: ${response.statusText}`);
        }

        const data: GalleryResponse | GalleryItem[] = await response.json();
        
        // Handle both response formats: array directly or paginated response with results
        let items: GalleryItem[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
          items = data.results;
        } else {
          throw new Error('Unexpected API response format');
        }
        
        // Filter only active items and sort by order
        const activeItems = items
          .filter(item => item.status)
          .sort((a, b) => a.order - b.order);
        setGalleryItems(activeItems);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load gallery items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Floating Petals Animation */}
      <FloatingPetals count={35} />
      
      <StoreNavbar solidBackground />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Curved gradient background */}
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
        
        {/* Additional soft gradient overlay */}
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
            {/* Gallery Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              }}
            >
              <ImageIcon className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Our Gallery</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900">
              Explore Our
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, #15b0bb 0%, #16bf9b 100%)',
                }}
              >
                Gallery
              </span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Discover our team, achievements, and the moments that define our journey in electric mobility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#15b0bb] mb-4" />
              <p className="text-gray-500">Loading gallery items...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-gray-700 font-medium mb-2">Failed to load gallery</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No gallery items available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <div
                    className="bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300"
                    style={{
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
                      <img
                        src={item.image_url || item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png';
                        }}
                      />
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Level Badge */}
                      {item.level_display && (
                        <div className="absolute top-4 right-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                            style={{
                              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.9) 0%, rgba(13, 148, 136, 0.9) 100%)',
                            }}
                          >
                            {item.level_display}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#15b0bb] transition-colors">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                      {item.created_by_username && (
                        <p className="text-xs text-gray-400">
                          Added by {item.created_by_username}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

