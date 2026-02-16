import { useEffect } from 'react';
import { StoreNavbar } from '@/store/StoreNavbar';
import { Footer } from '@/components/Footer';

export function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNavbar solidBackground />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated: February 16, 2025</p>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                This Privacy Policy describes how ZUJA Electrical Innovation Pvt. Ltd. ("Company", "we", "our", "us") collects, uses, discloses, and protects your information when you use our ASA Platform, including web and mobile applications.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Information We Collect</h2>
                <p className="text-gray-700 mb-3">We may collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Personal Identification Information:</strong> Name, phone number, email address, PAN card details, date of birth.</li>
                  <li><strong>KYC Information:</strong> Government-issued identity details for verification purposes.</li>
                  <li><strong>Financial Information:</strong> Payment transaction details (processed securely via Razorpay; we do not store card/bank credentials).</li>
                  <li><strong>Referral & Network Data:</strong> Referral links, team hierarchy, incentive eligibility.</li>
                  <li><strong>Technical Data:</strong> IP address and usage logs.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-3">We use your data to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Create and manage user accounts</li>
                  <li>Process bookings, payments, and payouts</li>
                  <li>Verify identity and comply with legal obligations</li>
                  <li>Manage referral, incentive, and promotion systems</li>
                  <li>Send alerts, notifications, and service-related communications</li>
                  <li>Improve platform security and user experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Data Sharing & Disclosure</h2>
                <p className="text-gray-700 mb-3">We may share data with:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Payment partners (Razorpay) for transaction processing</li>
                  <li>Cloud service providers (Azure) for hosting and storage</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Data Storage & Security</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Data is stored securely using industry-standard encryption</li>
                  <li>Access is restricted to authorized personnel only</li>
                  <li>We implement technical and organizational safeguards to prevent unauthorized access</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Cookies & Tracking</h2>
                <p className="text-gray-700">
                  We may use cookies and similar technologies to enhance user experience and analyze platform usage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. User Rights</h2>
                <p className="text-gray-700 mb-3">Users have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access and update personal information</li>
                  <li>Request deletion of account (subject to legal requirements)</li>
                  <li>Withdraw consent for optional communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Data Retention</h2>
                <p className="text-gray-700">
                  We retain personal data only as long as necessary to fulfill legal, operational, and contractual obligations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy periodically. Changes will be communicated through the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Contact Information</h2>
                <p className="text-gray-700 mb-3">
                  If you have questions or concerns regarding this Privacy Policy, contact:
                </p>
                <div className="text-gray-700">
                  <p className="font-semibold mb-1">ZUJA Electrical Innovation Pvt. Ltd.</p>
                  <p>Email: <a href="mailto:zujaelectric@gmail.com" className="text-[#15adc1] hover:underline">zujaelectric@gmail.com</a></p>
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

