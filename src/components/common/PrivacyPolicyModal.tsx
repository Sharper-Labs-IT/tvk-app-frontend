import React from 'react';
import { X, Lock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
                    <Lock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-display tracking-wide">
                      Privacy <span className="text-yellow-500">Policy</span>
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
                    <FileText size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">TVK Members Global Platform</span>
                  </div>
                  
                  <div className="space-y-2 pl-4 border-l-2 border-white/5 text-gray-400">
                    <p className="font-medium text-white">Operated By TVK MEMBERS LTD</p>
                    <p>Company Number: 16875735</p>
                    <p>Registered Office: 58 Croydon Road, Caterham, England, CR3 6QB</p>
                    <p>Email: <a href="mailto:Enquiries@TVKMEMBERS.world" className="text-yellow-500 hover:underline">Enquiries@TVKMEMBERS.world</a></p>
                  </div>
                </div>

                {/* Sections */}
                <Section title="1. Who We Are">
                  <p>This Privacy Policy explains how we collect, use and protect your personal data when you use the TVK Members platform.</p>
                  <p>TVK MEMBERS LTD operates the platform from the United Kingdom and acts as Data Controller under UK GDPR.</p>
                </Section>

                <Section title="2. Personal Data We Collect">
                  <p>We may collect:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                    <li>Name and contact details</li>
                    <li>Country of residence</li>
                    <li>Age confirmation</li>
                    <li>Account and login information</li>
                    <li>Subscription and payment status (payments processed securely by trusted third-party providers – we do not store full card details)</li>
                    <li>Merchandise purchase details (Super Fan Members only)</li>
                    <li>Delivery information where applicable</li>
                    <li>Usage, device and analytics data</li>
                    <li>Communications with us</li>
                  </ul>
                </Section>

                <Section title="3. How We Use Your Data">
                  <p>We use your personal data to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                    <li>Register and manage your account</li>
                    <li>Verify eligibility and age</li>
                    <li>Provide membership services</li>
                    <li>Manage Super Fan subscriptions and payments</li>
                    <li>Enable the purchase and delivery of merchandise</li>
                    <li>Administer competitions, events and rewards (where applicable)</li>
                    <li>Maintain platform safety, security and performance</li>
                    <li>Communicate with you regarding your membership</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </Section>

                <Section title="4. Lawful Basis for Processing">
                  <p>We rely on the following lawful bases under UK GDPR:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                    <li><span className="text-white">Performance of a contract</span> – to provide membership services and fulfil purchases</li>
                    <li><span className="text-white">Legitimate interests</span> – to operate, improve and secure the platform</li>
                    <li><span className="text-white">Consent</span> – for marketing communications, where required</li>
                    <li><span className="text-white">Legal obligation</span> – where we must comply with law</li>
                  </ul>
                </Section>

                <Section title="5. Sharing Your Data">
                  <p>We do not sell your personal data and we do not share your personal data with third parties for their own marketing purposes.</p>
                  <p>We only share data with trusted service providers who help us operate the platform, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                    <li>Secure payment processors</li>
                    <li>Email and communication service providers</li>
                    <li>Hosting, IT and security providers</li>
                    <li>Delivery / logistics partners where merchandise is purchased</li>
                    <li>Legal or regulatory authorities where required by law</li>
                  </ul>
                  <p className="mt-2">All service providers are required to handle your data securely and lawfully.</p>
                </Section>

                <Section title="6. International Users & Data Storage">
                  <p>The platform is operated from the UK. Personal data may be stored in the UK and/or secure international cloud services.</p>
                  <p>Where data is transferred outside the UK, appropriate safeguards are applied in accordance with UK data protection law.</p>
                </Section>

                <Section title="7. Marketing Communications">
                  <p>Your personal information is used to manage your membership and communicate TVK Members news, benefits, updates and promotions relating to www.tvkmembers.world.</p>
                  <p>You may unsubscribe at any time in accordance with applicable law.</p>
                </Section>

                <Section title="8. Children’s Data">
                  <p>This platform is for adults only. We do not knowingly collect or process personal data of anyone under 18. If we become aware that we have collected data relating to an individual under 18, we will delete it.</p>
                </Section>

                <Section title="9. Your Rights">
                  <p>Depending on your location, your data protection rights may include:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                    <li>The right to access your personal data</li>
                    <li>The right to correct inaccurate data</li>
                    <li>The right to request deletion of your data</li>
                    <li>The right to restrict processing</li>
                    <li>The right to object to certain processing</li>
                    <li>The right to withdraw consent (where processing is based on consent)</li>
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

export default PrivacyPolicyModal;
