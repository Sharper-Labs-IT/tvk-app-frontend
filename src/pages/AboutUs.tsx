import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedTitle from '../components/game/AnimatedTitle';
import { ShieldCheck, Globe, Heart , Award, Briefcase, MessageSquare } from 'lucide-react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-gold selection:text-black">
            <Header />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative px-6 md:px-12 lg:px-20 mb-20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="container mx-auto">
                        <div className="flex flex-col items-center text-center mt-12 mb-16">
                            <div className="inline-block px-4 py-1.5 mb-6 border border-brand-gold/30 rounded-full bg-brand-gold/10 backdrop-blur-sm">
                                <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">
                                    Our Story
                                </span>
                            </div>
                            
                            <AnimatedTitle
                                title="CELEBRATING A LEGACY <br /> CONNECTING FANS GLOBALLY"
                                containerClass="!text-white text-center text-4xl md:text-6xl lg:text-7xl font-zentry uppercase leading-[0.9] mb-8"
                            />
                            
                            <p className="max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed">
                                We are the premier independent global community dedicated to celebrating the cinematic journey of Thalapathy VJ
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission & Values Grid */}
                <section className="px-6 md:px-12 lg:px-20 mb-24 relative z-10">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Globe className="w-8 h-8 text-brand-gold" />,
                                    title: "Global Community",
                                    desc: "Uniting fans from over 30 countries in a single digital home."
                                },
                                {
                                    icon: <Heart className="w-8 h-8 text-brand-gold" />,
                                    title: "Fan-First Focus",
                                    desc: "Built by fans, for fans. Every feature is designed to enhance your experience."
                                },
                                {
                                    icon: <Award className="w-8 h-8 text-brand-gold" />,
                                    title: "Preserving Legacy",
                                    desc: "Creating a digital archive and celebration of a 30-year cinematic journey."
                                }
                            ].map((item, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-brand-gold/50 transition-colors duration-300 group"
                                >
                                    <div className="mb-6 p-3 bg-brand-gold/10 rounded-xl inline-block group-hover:bg-brand-gold/20 transition-colors">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold font-zentry tracking-wide mb-3 uppercase">{item.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Important Disclaimer Section */}
                <section className="px-6 md:px-12 lg:px-20 mb-24">
                    <div className="container mx-auto">
                        <div className="bg-gradient-to-br from-brand-footerBlue/50 to-brand-dark border border-brand-gold/20 p-8 md:p-12 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 text-[200px] opacity-[0.03] rotate-12 pointer-events-none">
                                <ShieldCheck />
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-zentry uppercase mb-6 text-brand-gold">
                                        Independent & Unaffiliated
                                    </h3>
                                    <p className="text-gray-300 mb-6 leading-relaxed">
                                        VJ Fans Hub is an independent fan-led platform established in the United Kingdom. We are dedicated solely to the celebration of art, cinema, and the entertainment legacy of actor VJ.
                                    </p>
                                    <p className="text-gray-300 mb-6 leading-relaxed font-semibold">
                                        We are NOT affiliated with, funded by, or associated with any political party or organization in India or elsewhere.
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-gray-400 text-sm">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                                            <span>Registered as VJ FANS HUB LTD in the United Kingdom</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-gray-400 text-sm">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                                            <span>100% Independent Operations</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-black/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Briefcase className="w-10 h-10 text-brand-gold" />
                                        <div>
                                            <h4 className="font-bold text-white">VJ FANS HUB LTD</h4>
                                            <p className="text-sm text-gray-400">Company Registration #16875735</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-sm text-gray-400 border-t border-white/10 pt-6">
                                        <div className="flex justify-between">
                                            <span>Incorporated In:</span>
                                            <span className="text-white">United Kingdom</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Operating Status:</span>
                                            <span className="text-brand-gold">Active</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nature of Business:</span>
                                            <span className="text-white">Fan Community Platform</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team / Community Section */}
                <section className="px-6 md:px-12 lg:px-20 mb-24">
                    <div className="container mx-auto text-center">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-zentry uppercase mb-8">
                                Powered by <span className="text-brand-gold">Fans Like You</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-12">
                                Our platform is built and maintained by a dedicated global team of developers, designers, and content creators who share a common passion.
                            </p>
                            
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
                                <MessageSquare className="w-16 h-16 text-brand-gold mx-auto mb-6 opacity-50" />
                                <h3 className="text-xl font-bold mb-4">Help Us Improve?</h3>
                                <p className="text-sm text-gray-400 mb-8">
                                    Your feedback shapes our community. Whether it's a suggestion, a bug report, or just a friendly message—we want to hear it all to make this platform better for you.
                                </p>
                                <a 
                                    href="mailto:contact@vjfanshub.com?subject=Feedback for VJ Fans Hub" 
                                    className="inline-flex items-center justify-center px-8 py-3 bg-brand-gold text-black font-black uppercase rounded-lg hover:bg-brand-goldDark transition-all duration-300"
                                >
                                    Send Feedback
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 md:px-12 lg:px-20">
                    <div className="container mx-auto">
                        <div className="relative rounded-3xl overflow-hidden bg-brand-gold">
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/20 blur-[100px] rounded-full" />
                            
                            <div className="relative z-10 px-8 py-20 text-center">
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-zentry uppercase text-black mb-6">
                                    Be Part of History
                                </h2>
                                <p className="text-black/80 text-xl font-semibold max-w-2xl mx-auto mb-10">
                                    Join the fastest growing community celebrating the legacy of The Greatest of All Time.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link 
                                        to="/signup"
                                        className="px-8 py-4 bg-black text-white font-black uppercase rounded-lg hover:scale-105 transition-transform duration-300 shadow-xl"
                                    >
                                        Join Now
                                    </Link>
                                    <Link 
                                        to="/membership"
                                        className="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-black/10 text-black font-black uppercase rounded-lg hover:bg-white/30 transition-all duration-300"
                                    >
                                        View Plans
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
