import { useEffect } from 'react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Footer } from '@/components/Footer';

export function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNavbar solidBackground />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms & Conditions</h1>
            
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Platform Usage</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The ZUJA Electrical Innovation Pvt. Ltd. platform is designed exclusively for Authorized Sales Associates (ASA), registered users, and customers for facilitating electric vehicle bookings, referral-based sales tracking, payment processing, incentive calculation, and post-booking services.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>The platform must be used only for lawful and authorized purposes.</li>
                  <li>Users shall not attempt to manipulate booking data, referral structures, incentives, or access restricted administrative areas.</li>
                  <li>ZUJA reserves the right to modify, suspend, or discontinue any part of the platform.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Payments & Transactions</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>All payments are processed through RBI-authorized third-party payment gateways.</li>
                  <li>ZUJA does not store card, UPI, or bank credentials.</li>
                  <li>Transaction records are maintained for compliance, audit, and dispute resolution.</li>
                  <li>ZUJA is not responsible for payment failures caused by banking systems or gateways.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">User Responsibilities</h2>
                <p className="text-gray-700 mb-3">Users must provide accurate information including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>PAN details</li>
                  <li>KYC documents</li>
                  <li>Contact details</li>
                  <li>Bank information</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Providing false or misleading information may result in suspension, termination, incentive forfeiture, or legal action. Users must comply with applicable laws and taxes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Referral & Incentives</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Incentives are calculated strictly based on verified and completed vehicle bookings.</li>
                  <li>No recruitment-based income is allowed.</li>
                  <li>ZUJA may revise incentive structures and withhold incentives in cases of misuse or violation.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Limitation of Liability</h2>
                <p className="text-gray-700 mb-3">ZUJA shall not be liable for:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Indirect or consequential damages</li>
                  <li>Loss of income</li>
                  <li>Service interruptions</li>
                  <li>Third-party failures</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  The platform is provided on an 'as-is' basis without warranties of uninterrupted service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Governing Law & Jurisdiction</h2>
                <p className="text-gray-700">
                  These terms are governed by the laws of India. Jurisdiction shall lie exclusively with the courts of Kerala, India.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Company Information</h2>
                <div className="text-gray-700">
                  <p className="font-semibold mb-2">ZUJA ELECTRICAL INNOVATION PRIVATE LIMITED</p>
                  <p className="mb-1"><strong>Registered Address:</strong></p>
                  <p className="mb-4">
                    C/O Sabu Mathew, Kuttiyadiyil, Arrattuvazhy,<br />
                    Alappuzha North, Ambalapuzha A,<br />
                    Alappuzha – 688007, Kerala, India
                  </p>
                  <p className="mb-1">Email: <a href="mailto:zujaelectric@gmail.com" className="text-[#15adc1] hover:underline">zujaelectric@gmail.com</a></p>
                  <p>Phone: <a href="tel:7356360777" className="text-[#15adc1] hover:underline">+91 7356360777</a></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

