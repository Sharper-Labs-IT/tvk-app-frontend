import React from 'react';
import { motion } from 'framer-motion';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white pt-24 pb-12 px-4 md:px-8 lg:px-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-brand-card-bg p-8 rounded-lg shadow-lg border border-brand-gold/20"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-brand-gold mb-6 text-center">
          TVK MEMBERS LTD Cookie Policy
        </h1>
        
        <p className="mb-6 text-gray-300">
          This Cookie Policy applies to the TVK Members website available at: <a href="https://www.tvkmembers.world" className="text-brand-gold hover:underline">www.tvkmembers.world</a>
        </p>

        <p className="mb-6 text-gray-300">
          We use cookies on the TVK Members website to help it work properly, make it easier to use, and to understand how people use it so we can improve the experience.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-gold mb-4">What are cookies?</h2>
          <p className="text-gray-300">
            Cookies are small files saved on your device when you visit our website. Some are essential so the site works correctly, and others help us improve the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-gold mb-4">What types of cookies do we use?</h2>
          
          <div className="space-y-4">
            <div className="bg-brand-dark/50 p-4 rounded border border-brand-gold/10">
              <h3 className="text-xl font-medium text-white mb-2">1. Essential Cookies</h3>
              <p className="text-gray-300">
                These are needed for security, log-ins, browsing and basic site features. The website cannot function properly without them.
              </p>
            </div>

            <div className="bg-brand-dark/50 p-4 rounded border border-brand-gold/10">
              <h3 className="text-xl font-medium text-white mb-2">2. Preference Cookies</h3>
              <p className="text-gray-300">
                These remember your settings, such as preferences or choices you make, to make your experience smoother.
              </p>
            </div>

            <div className="bg-brand-dark/50 p-4 rounded border border-brand-gold/10">
              <h3 className="text-xl font-medium text-white mb-2">3. Analytics Cookies</h3>
              <p className="text-gray-300">
                These help us understand how visitors use the site so we can improve it. We only use these if you consent.
              </p>
            </div>

            <div className="bg-brand-dark/50 p-4 rounded border border-brand-gold/10">
              <h3 className="text-xl font-medium text-white mb-2">4. Marketing Cookies (if used in future)</h3>
              <p className="text-gray-300">
                If we introduce advertising or promotional tools later, we will update this policy and ask for consent before using them.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-gold mb-4">Your Choice</h2>
          <p className="text-gray-300">
            When you visit the site, you can accept or reject non-essential cookies. You can also change your browser settings at any time to block or delete cookies. Blocking some cookies may affect how the site works.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-gold mb-4">Legal Basis</h2>
          <p className="text-gray-300">
            Essential cookies are used because we have a legitimate interest in running a secure, working website. All other cookies are used only with your consent, in line with UK GDPR and PECR.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-gold mb-4">Updates</h2>
          <p className="text-gray-300">
            We may update this policy from time to time and will post any changes here.
          </p>
        </section>

        <section className="mb-8 border-t border-brand-gold/20 pt-6">
          <h2 className="text-2xl font-semibold text-brand-gold mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-2">
            If you have any questions, please contact:
          </p>
          <p className="text-white font-medium">TVK MEMBERS LTD</p>
          <p className="text-gray-300">
            Email: <a href="mailto:enquiries@tvkmembers.world" className="text-brand-gold hover:underline">enquiries@tvkmembers.world</a>
          </p>
        </section>

        <div className="text-sm text-gray-500 text-center mt-8">
          Last Updated: 01/01/2026
        </div>
      </motion.div>
    </div>
  );
};

export default CookiePolicy;
