import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedTitle from '../components/game/AnimatedTitle';
import { ShieldCheck, Globe, Heart, Award, Briefcase, MessageSquare, Sparkles, Users, Zap, Target, Star, TrendingUp, Trophy, Film, Music, Palette, Code } from 'lucide-react';

// Magnetic Button Component
const MagneticButton: React.FC<{ children: React.ReactNode; className?: string; href?: string; to?: string }> = ({ children, className, href, to }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    // Use a ref for the motion div to track mouse movement relative to it
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setPosition({ x: x * 0.2, y: y * 0.2 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    // Ensure the inner element has display: inline-block or flex to respect padding/sizing
    const finalClassName = `${className || ''} inline-flex items-center justify-center`;

    const content = to ? (
        <Link to={to} className={finalClassName}>
            {children}
        </Link>
    ) : href ? (
        <a href={href} className={finalClassName}>
            {children}
        </a>
    ) : (
        <button className={finalClassName}>{children}</button>
    );

    return (
        <motion.div
            ref={buttonRef}
            className="inline-block" // Ensure wrapper doesn't take full width
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {content}
        </motion.div>
    );
};

// Floating Particle Component
const FloatingParticle: React.FC<{ delay: number; duration: number; x: string; size: number }> = ({ delay, duration, x, size }) => (
    <motion.div
        className="absolute rounded-full bg-brand-gold/20 blur-sm"
        style={{ left: x, width: size, height: size }}
        initial={{ y: '100vh', opacity: 0 }}
        animate={{
            y: '-100vh',
            opacity: [0, 1, 1, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "linear"
        }}
    />
);

const AboutUs: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const heroY = useTransform(smoothProgress, [0, 0.3], [0, -200]);
    // Removed the global section opacity to allow individual elements to fade out separately
    // const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);

    // Create staggered opacity transforms for line-by-line disappearance
    const badgeOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
    const titleOpacity = useTransform(smoothProgress, [0.05, 0.15], [1, 0]);
    const descOpacity = useTransform(smoothProgress, [0.1, 0.2], [1, 0]);
    const statsOpacity = useTransform(smoothProgress, [0.15, 0.25], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-gold selection:text-black overflow-hidden">
            <Header />

            {/* Floating Particles Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <FloatingParticle
                        key={i}
                        delay={i * 0.8}
                        duration={10 + i * 2}
                        x={`${Math.random() * 100}%`}
                        size={Math.random() * 4 + 2}
                    />
                ))}
            </div>

            <main className="pt-24 pb-16 relative">
                {/* Hero Section - Enhanced with Parallax */}
                <motion.section 
                    style={{ y: heroY, scale: heroScale }} // Removed global opacity here
                    className="relative px-6 md:px-12 lg:px-20 mb-32 overflow-hidden min-h-[80vh] flex items-center"
                >
                    {/* Animated Background Gradients */}
                    <motion.div 
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/10 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ filter: 'blur(120px)' }}
                    />
                    <motion.div 
                        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        style={{ filter: 'blur(120px)' }}
                    />
                    
                    <div className="container mx-auto relative z-10">
                        <div className="flex flex-col items-center text-center mt-12 mb-16">
                            <motion.div 
                                style={{ opacity: badgeOpacity }} // Applied dynamic scroll opacity
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-block px-6 py-2 mb-8 border border-brand-gold/40 rounded-full bg-brand-gold/10 backdrop-blur-md relative overflow-hidden group"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-brand-gold/20"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6 }}
                                />
                                <span className="relative text-brand-gold text-sm font-black tracking-[0.3em] uppercase flex items-center gap-2">
                                    Our Story
                                </span>
                            </motion.div>
                            
                            <motion.div
                                style={{ opacity: titleOpacity }} // Applied dynamic scroll opacity
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <AnimatedTitle
                                    title="CELEBRATING A LEGACY <br /> CONNECTING FANS GLOBALLY"
                                    containerClass="!text-white text-center text-4xl md:text-6xl lg:text-8xl font-zentry uppercase leading-[0.9] mb-12"
                                />
                            </motion.div>
                            
                            <motion.p 
                                style={{ opacity: descOpacity }} // Applied dynamic scroll opacity
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="max-w-3xl text-gray-300 text-xl md:text-2xl leading-relaxed mb-12 font-light"
                            >
                                We are the premier independent global community dedicated to celebrating the <span className="text-brand-gold font-semibold">cinematic journey</span> of Thalapathy VJ
                            </motion.p>

                            {/* Stats Counter */}
                            <motion.div 
                                style={{ opacity: statsOpacity }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-8"
                            >
                                {[
                                    { number: '30+', label: 'Countries', icon: Globe },
                                    { number: '50K+', label: 'Community Members', icon: Users },
                                    { number: '100+', label: 'Events Hosted', icon: Trophy },
                                    { number: '30', label: 'Years of Legacy', icon: Star }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200 }}
                                        whileHover={{ scale: 1.1 }}
                                        className="text-center"
                                    >
                                        <stat.icon className="w-8 h-8 text-brand-gold mx-auto mb-3" />
                                        <div className="text-4xl md:text-5xl font-black text-brand-gold mb-2">{stat.number}</div>
                                        <div className="text-sm text-gray-400 uppercase tracking-wide">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Mission & Values Grid - Enhanced 3D Cards */}
                <section className="px-6 md:px-12 lg:px-20 mb-32 relative z-10">
                    <div className="container mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-zentry uppercase mb-4 bg-gradient-to-r from-white via-brand-gold to-white bg-clip-text text-transparent">
                                What Drives Us
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto" />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Globe className="w-10 h-10" />,
                                    title: "Global Community",
                                    desc: "Uniting fans from over 30 countries in a single digital home.",
                                    color: "from-blue-500/20 to-cyan-500/20",
                                    borderColor: "group-hover:border-blue-500/50"
                                },
                                {
                                    icon: <Heart className="w-10 h-10" />,
                                    title: "Fan-First Focus",
                                    desc: "Built by fans, for fans. Every feature is designed to enhance your experience.",
                                    color: "from-red-500/20 to-pink-500/20",
                                    borderColor: "group-hover:border-red-500/50"
                                },
                                {
                                    icon: <Award className="w-10 h-10" />,
                                    title: "Preserving Legacy",
                                    desc: "Creating a digital archive and celebration of a 30-year cinematic journey.",
                                    color: "from-amber-500/20 to-yellow-500/20",
                                    borderColor: "group-hover:border-amber-500/50"
                                }
                            ].map((item, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, y: 50, rotateX: -15 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ 
                                        delay: index * 0.15,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    whileHover={{ 
                                        y: -10,
                                        scale: 1.02,
                                        transition: { duration: 0.3 }
                                    }}
                                    className={`group relative bg-gradient-to-br ${item.color} backdrop-blur-xl border border-white/10 ${item.borderColor} p-8 rounded-3xl transition-all duration-500 overflow-hidden`}
                                    style={{ perspective: '1000px' }}
                                >
                                    {/* Glow Effect */}
                                    <motion.div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-brand-gold/10 via-transparent to-transparent transition-opacity duration-500"
                                        initial={false}
                                    />
                                    
                                    {/* Shimmer Effect */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        style={{
                                            background: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%)',
                                            backgroundSize: '200% 200%'
                                        }}
                                    />

                                    <div className="relative z-10">
                                        <motion.div 
                                            className="mb-6 p-4 bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-300"
                                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <div className="text-brand-gold">{item.icon}</div>
                                        </motion.div>
                                        <h3 className="text-2xl font-black font-zentry tracking-wide mb-4 uppercase bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-lg">{item.desc}</p>
                                    </div>

                                    {/* Corner Accent */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/10 transition-all duration-500" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Interactive Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-24 relative"
                        >
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-zentry uppercase mb-4 text-white">
                                    Our Journey
                                </h2>
                                <p className="text-gray-400 text-lg">A timeline of passion and dedication</p>
                            </div>

                            <div className="relative max-w-5xl mx-auto">
                                {/* Timeline Line */}
                                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-brand-gold via-brand-gold/50 to-transparent" />

                                {[
                                    { year: 'March 1, 2026', title: 'Official Relaunch', desc: 'The new and improved VJ Fans Hub goes live for fans worldwide', icon: Zap },
                                    { year: 'April 2026', title: 'Community Expansion', desc: 'Targeting 10,000+ active members across continents', icon: TrendingUp },
                                    { year: 'Summer 2026', title: 'Global Events', desc: 'Hosting premiere watch parties and fan meetups', icon: Target },
                                    { year: 'Beyond', title: 'The Future', desc: 'Expanding with new features and experiences', icon: Sparkles }
                                ].map((milestone, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ delay: i * 0.2 }}
                                        className={`relative flex ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center mb-16 gap-8`}
                                    >
                                        <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="inline-block bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-brand-gold/50 transition-all duration-300"
                                            >
                                                <div className="text-brand-gold font-black text-2xl mb-2">{milestone.year}</div>
                                                <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                                                <p className="text-gray-400">{milestone.desc}</p>
                                            </motion.div>
                                        </div>

                                        {/* Center Icon */}
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                            className="relative z-10 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-brand-gold to-amber-600 rounded-full shadow-xl shadow-brand-gold/50"
                                        >
                                            <milestone.icon className="w-8 h-8 text-black" />
                                        </motion.div>

                                        <div className="flex-1" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Important Disclaimer Section - Enhanced */}
                <section className="px-6 md:px-12 lg:px-20 mb-32">
                    <div className="container mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative bg-gradient-to-br from-brand-footerBlue/30 via-brand-dark to-brand-footerBlue/30 border-2 border-brand-gold/30 p-8 md:p-16 rounded-[3rem] overflow-hidden group"
                        >
                            {/* Animated Background Elements */}
                            <motion.div 
                                className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-gold/10 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 90, 0],
                                    opacity: [0.1, 0.2, 0.1]
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{ filter: 'blur(80px)' }}
                            />

                            <motion.div 
                                className="absolute bottom-0 left-0 text-[250px] opacity-[0.03] pointer-events-none"
                                animate={{ rotate: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            >
                                <ShieldCheck />
                            </motion.div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div
                                            animate={{ 
                                                boxShadow: [
                                                    '0 0 20px rgba(255,215,0,0.3)',
                                                    '0 0 40px rgba(255,215,0,0.5)',
                                                    '0 0 20px rgba(255,215,0,0.3)'
                                                ]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="p-3 bg-brand-gold/20 rounded-2xl"
                                        >
                                            <ShieldCheck className="w-10 h-10 text-brand-gold" />
                                        </motion.div>
                                        <h3 className="text-3xl md:text-4xl font-zentry uppercase text-brand-gold">
                                            Independent & Unaffiliated
                                        </h3>
                                    </div>
                                    
                                    <p className="text-gray-200 text-lg mb-6 leading-relaxed">
                                        VJ Fans Hub is an <span className="text-white font-bold">independent fan-led platform</span> established in the United Kingdom. We are dedicated solely to the celebration of art, cinema, and the entertainment legacy of actor VJ.
                                    </p>
                                    <motion.p 
                                        className="text-white text-xl mb-8 leading-relaxed font-bold bg-red-500/10 border-l-4 border-red-500 pl-6 py-4 rounded-r-xl"
                                        whileInView={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        We are NOT affiliated with, funded by, or associated with any political party or organization in India or elsewhere.
                                    </motion.p>
                                    <ul className="space-y-4">
                                        {[
                                            'Registered as VJ FANS HUB LTD in the United Kingdom',
                                            '100% Independent Operations',
                                            'No Political Affiliations',
                                            'Pure Entertainment & Cinema Focus'
                                        ].map((item, i) => (
                                            <motion.li 
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.3 + i * 0.1 }}
                                                className="flex items-start gap-4 text-gray-300 text-lg group/item"
                                            >
                                                <motion.div 
                                                    className="mt-1.5 w-2 h-2 rounded-full bg-brand-gold shrink-0"
                                                    whileHover={{ scale: 1.5 }}
                                                />
                                                <span className="group-hover/item:text-white transition-colors">{item}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="relative"
                                >
                                    <motion.div 
                                        className="bg-gradient-to-br from-black/50 to-brand-gold/10 p-10 rounded-3xl border-2 border-brand-gold/30 backdrop-blur-xl relative overflow-hidden group/card"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Hover Gradient Effect */}
                                        <motion.div
                                            className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                                            style={{
                                                background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,215,0,0.15), transparent 50%)',
                                            }}
                                        />

                                        <div className="flex items-center gap-4 mb-8 relative z-10">
                                            <motion.div
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                                className="p-4 bg-gradient-to-br from-brand-gold to-amber-600 rounded-2xl shadow-lg shadow-brand-gold/50"
                                            >
                                                <Briefcase className="w-10 h-10 text-black" />
                                            </motion.div>
                                            <div>
                                                <h4 className="font-black text-white text-2xl">VJ FANS HUB LTD</h4>
                                                {/* <p className="text-base text-brand-gold font-semibold">Company Registration #16875735</p> */}
                                            </div>
                                        </div>

                                        <div className="space-y-5 text-base text-gray-300 border-t-2 border-white/10 pt-8 relative z-10">
                                            {[
                                                { label: 'Incorporated In:', value: 'United Kingdom', gradient: true },
                                                { label: 'Operating Status:', value: 'Active', highlight: true },
                                                { label: 'Nature of Business:', value: 'Fan Community Platform', gradient: true },
                                                { label: 'Registration Year:', value: '2025', gradient: true }
                                            ].map((item, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                    className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="font-medium">{item.label}</span>
                                                    <span className={`font-bold ${
                                                        item.highlight 
                                                            ? 'text-brand-gold' 
                                                            : item.gradient 
                                                            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                                                            : 'text-white'
                                                    }`}>
                                                        {item.value}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Verified Badge */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                            className="mt-6 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full"
                                        >
                                            <ShieldCheck className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-bold text-sm">Verified & Registered</span>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Team / Community Section - Enhanced */}
                <section className="px-6 md:px-12 lg:px-20 mb-32">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-zentry uppercase mb-4">
                                Powered by <span className="bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold bg-clip-text text-transparent">Fans Like You</span>
                            </h2>
                            <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto">
                                Our platform is built and maintained by a dedicated global team of developers, designers, and content creators who share a common passion.
                            </p>
                        </motion.div>

                        {/* Team Roles Grid */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                        >
                            {[
                                { icon: Code, label: 'Developers', count: '10+', color: 'from-blue-500 to-cyan-500' },
                                { icon: Palette, label: 'Designers', count: '5+', color: 'from-purple-500 to-pink-500' },
                                { icon: Film, label: 'Content Creators', count: '15+', color: 'from-red-500 to-orange-500' },
                                { icon: Music, label: 'Community Mods', count: '20+', color: 'from-green-500 to-emerald-500' }
                            ].map((role, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="relative group"
                                >
                                    <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:border-brand-gold/50 transition-all duration-300">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${role.color} p-4 shadow-lg`}
                                        >
                                            <role.icon className="w-full h-full text-white" />
                                        </motion.div>
                                        <div className="text-3xl font-black text-brand-gold mb-2">{role.count}</div>
                                        <div className="text-gray-300 font-semibold">{role.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Feedback Card - Premium Design */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="relative bg-gradient-to-br from-brand-gold/10 via-purple-500/10 to-blue-500/10 border-2 border-white/20 rounded-[3rem] p-12 md:p-16 overflow-hidden group">
                                {/* Animated Background Orbs */}
                                <motion.div
                                    className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/20 rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        x: [0, 50, 0],
                                        y: [0, 30, 0],
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={{ filter: 'blur(60px)' }}
                                />
                                <motion.div
                                    className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        x: [0, -50, 0],
                                        y: [0, -30, 0],
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    }}
                                    style={{ filter: 'blur(60px)' }}
                                />

                                <div className="relative z-10">
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 360],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ 
                                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-brand-gold to-amber-600 p-5 shadow-2xl shadow-brand-gold/50"
                                    >
                                        <MessageSquare className="w-full h-full text-black" />
                                    </motion.div>

                                    <h3 className="text-3xl md:text-4xl font-black mb-4 text-center bg-gradient-to-r from-white via-brand-gold to-white bg-clip-text text-transparent">
                                        Help Us Improve
                                    </h3>
                                    <p className="text-lg text-gray-300 mb-10 text-center max-w-2xl mx-auto leading-relaxed">
                                        Your feedback shapes our community. Whether it's a suggestion, a bug report, or just a friendly message we want to hear it all to make this platform <span className="text-brand-gold font-bold">better for you</span>.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        <div
                                            className="group/btn relative px-10 py-5 bg-gradient-to-r from-brand-gold to-amber-600 text-black font-black uppercase rounded-2xl overflow-hidden shadow-xl shadow-brand-gold/30 hover:shadow-2xl hover:shadow-brand-gold/50 transition-all duration-300 cursor-pointer"
                                            onClick={() => window.location.href = "mailto:contact@vjfanshub.com?subject=Feedback for VJ Fans Hub"}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-amber-600 to-brand-gold opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                            />
                                            <span className="relative flex items-center gap-3">
                                                <MessageSquare className="w-5 h-5" />
                                                Send Us Feedback
                                            </span>
                                        </div>
                                    </div>

                                    {/* Social Proof */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-10 flex items-center justify-center gap-6 flex-wrap"
                                    >
                                        <div className="flex items-center gap-2">
                                            
                                            <span className="text-sm text-gray-400">500+ feedback received</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 text-brand-gold fill-brand-gold" />
                                            ))}
                                            <span className="text-sm text-gray-400 ml-2">4.9/5 rating</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section - Ultimate Design */}
                <section className="px-6 md:px-12 lg:px-20 mb-20">
                    <div className="container mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative rounded-[3rem] overflow-hidden"
                        >
                            {/* Animated Gradient Background */}
                            <motion.div
                                className="absolute inset-0"
                                animate={{
                                    background: [
                                        'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                                        'linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FFA500 100%)',
                                        'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                                    ],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Overlay Pattern */}
                            <div className="absolute inset-0 bg-black/5" 
                                style={{
                                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                                     radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                                }}
                            />

                            {/* Animated Orbs */}
                            <motion.div 
                                className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/30 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    x: [-20, 0, -20],
                                    y: [-20, 0, -20],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{ filter: 'blur(100px)' }}
                            />
                            <motion.div 
                                className="absolute -right-20 -top-20 w-96 h-96 bg-amber-300/30 rounded-full"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    x: [20, 0, 20],
                                    y: [20, 0, 20],
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                style={{ filter: 'blur(100px)' }}
                            />
                            
                            <div className="relative z-10 px-8 py-24 text-center">
                                {/* Sparkles Animation */}
                                <motion.div
                                    className="flex justify-center mb-8"
                                    animate={{ 
                                        rotate: [0, 360],
                                    }}
                                    transition={{ 
                                        duration: 20, 
                                        repeat: Infinity,
                                        ease: "linear" 
                                    }}
                                >
                                    
                                </motion.div>

                                <motion.h2 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-5xl md:text-6xl lg:text-7xl font-zentry uppercase text-black mb-6 leading-tight"
                                >
                                    Be Part of <br/>
                                    <span className="relative inline-block">
                                        <span className="relative z-10">History</span>
                                        <motion.span
                                            className="absolute bottom-2 left-0 right-0 h-4 bg-black/10"
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                        />
                                    </span>
                                </motion.h2>

                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="text-black/90 text-xl md:text-2xl font-bold max-w-3xl mx-auto mb-12 leading-relaxed"
                                >
                                    Join the fastest growing community celebrating the legacy of <span className="text-black">The Greatest of All Time</span>.
                                </motion.p>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col sm:flex-row justify-center gap-6 mb-12"
                                >
                                    <MagneticButton
                                        to="/signup"
                                        className="group/btn relative px-12 py-6 bg-black text-white font-black text-lg uppercase rounded-2xl overflow-hidden shadow-2xl shadow-black/50 hover:shadow-black/70 transition-all duration-300"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                        />
                                        <span className="relative flex items-center gap-3">
                                            <Users className="w-6 h-6 text-brand-gold" />
                                            Join Free
                                        </span>
                                    </MagneticButton>
                                </motion.div>

                                {/* Trust Indicators */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-wrap items-center justify-center gap-8 text-black/70 text-sm font-semibold"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span>100% Secure</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <span>50K+ Members</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        <span>4.9/5 Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        <span>30+ Countries</span>
                                    </div>
                                </motion.div>

                                {/* Animated Wave Border */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-black/20 to-transparent"
                                    animate={{
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Extra Feature Cards Below CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
                        >
                            {[
                                { icon: Zap, title: 'Instant Access', desc: 'Start exploring immediately after signup' },
                                { icon: Trophy, title: 'Exclusive Content', desc: 'Members-only articles, games & events' },
                                { icon: Heart, title: 'Active Community', desc: 'Connect with passionate fans worldwide' }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-brand-gold/50 transition-all duration-300"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-gold to-amber-600 p-3 shadow-lg shadow-brand-gold/30"
                                    >
                                        <feature.icon className="w-full h-full text-black" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
