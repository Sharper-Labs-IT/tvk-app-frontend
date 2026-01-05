import React from 'react';
import { X, ShieldCheck, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-900/95 border border-yellow-500/20 rounded-2xl shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)] overflow-hidden flex flex-col"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-display tracking-wide">
                      Terms & <span className="text-yellow-500">Conditions</span>
                    </h2>
                    <p className="text-xs text-gray-400">Last updated: December 2025</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="group p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Content */}
              <div className="relative p-6 overflow-y-auto custom-scrollbar space-y-6 text-gray-300 text-sm leading-relaxed">
                {/* Introduction Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-500/80 mb-2">
                    <ScrollText size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">TVK Members Global Platform</span>
                  </div>
                  
                  <div className="space-y-4 pl-4 border-l-2 border-white/5">
                    <p><span className="text-white font-medium">1.1</span> These Terms & Conditions ("Terms") apply to all users of the TVK Members platform ("we", "us", "our", "Platform").</p>
                    <p><span className="text-white font-medium">1.2</span> The Platform is operated from the United Kingdom by TVK MEMBERS LTD, Company Number 16875735, registered at 58 Croydon Road, Caterham, England, CR3 6QB.</p>
                    <p><span className="text-white font-medium">1.3</span> By creating an account, accessing or using the Platform, you confirm that you accept these Terms and agree to comply with them.</p>
                    <p><span className="text-white font-medium">1.4</span> TVK Members is an independent international fan platform. It is not officially associated with, endorsed, authorised or sponsored by actor Vijay, his representatives, production companies, or any official fan organisation.</p>
                    <p><span className="text-white font-medium">1.5</span> If you do not agree to these Terms, you must not use this Platform.</p>
                  </div>
                </div>

                {/* Sections with Headers */}
                <Section title="2. Eligibility">
                  <p>2.1 Membership is currently available to fans residing outside India only.</p>
                  <p>2.2 You must be at least 18 years old to register, subscribe, make payments, purchase merchandise, or participate in any features, activities, games, or competitions.</p>
                  <p>2.3 You are responsible for ensuring that your participation, use of services and any payments are lawful in your country of residence.</p>
                  <p>2.4 We reserve the right to refuse, suspend or terminate membership where eligibility requirements are not met.</p>
                </Section>

                <Section title="3. Types of Membership">
                  <p>3.1 <span className="text-white">Free Membership:</span> Users may register for a free account and access designated features.</p>
                  <p>3.2 <span className="text-yellow-500">Super Fan Membership:</span> Users may subscribe to a paid monthly membership currently charged at £9.99 per month. Additional benefits and features may be provided and may change from time to time.</p>
                </Section>

                <Section title="4. Account Registration">
                  <p>4.1 You must provide accurate and complete information when registering.</p>
                  <p>4.2 You agree not to share your account or allow anyone else to access your account.</p>
                  <p>4.3 We may suspend or terminate accounts where false or misleading information is provided or misuse occurs.</p>
                </Section>

                <Section title="5. Subscription Payments (Super Fan Only)">
                  <p>5.1 Super Fan Membership is charged on a recurring monthly subscription basis at £9.99 per month unless otherwise stated.</p>
                  <p>5.2 Your subscription will automatically renew each month unless you cancel it in advance of your next billing date.</p>
                  <p>5.3 You may cancel your subscription at any time through your account settings or via your payment provider.</p>
                  <p>5.4 We do not provide refunds for subscription fees already paid, unless legally required.</p>
                </Section>

                <Section title="6. Merchandise Sales">
                  <p>6.1 Exclusive TVK Members merchandise is available only to active Super Fan Members.</p>
                  <p>6.2 Merchandise may be offered internationally where operationally possible.</p>
                  <p>6.3 All prices exclude customs duties, import taxes and local charges.</p>
                </Section>

                <Section title="7. Games, Contests & Events">
                  <p>7.1 Participation in any games, contests, raffles, rewards or events is voluntary.</p>
                  <p>7.2 These activities may be subject to separate eligibility rules and country-specific legal restrictions.</p>
                </Section>

                <Section title="8. Platform Conduct">
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                    <li>Misuse the Platform</li>
                    <li>Harass, abuse or harm others</li>
                    <li>Impersonate official representatives</li>
                    <li>Use the Platform for unlawful activity</li>
                  </ul>
                </Section>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-white font-bold mb-2">Contact</h3>
                  <p className="text-gray-400">TVK MEMBERS LTD</p>
                  <p className="text-gray-400">58 Croydon Road, Caterham, England, CR3 6QB</p>
                  <a href="mailto:Enquiries@TVKMEMBERS.world" className="text-yellow-500 hover:underline">Enquiries@TVKMEMBERS.world</a>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-sm flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors transform hover:scale-105 active:scale-95"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
      <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
      {title}
    </h3>
    <div className="space-y-2 pl-3 text-gray-400">
      {children}
    </div>
  </div>
);

export default TermsModal;
