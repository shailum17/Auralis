import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiCheck } from "react-icons/fi";

const SECTION_HEIGHT = 1500;

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 scroll-smooth">
      <Navigation />
      <Hero />
    </div>
  );
};

const Navigation = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex shrink-0">
            <a href="#" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Student Community</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-900"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {!expanded ? (
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:items-center md:justify-start md:ml-16 md:mr-auto md:space-x-10 md:flex">
            <a href="#features" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Features
            </a>
            <a href="#wellness" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Wellness
            </a>
            <a href="#community" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Community
            </a>
          </div>

          <div className="hidden md:block">
            <button
              onClick={() => {
                document.getElementById("student-stories")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors mr-4"
            >
              STUDENT STORIES <FiArrowRight />
            </button>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 z-0 rounded-lg blur-[10px] opacity-60 pointer-events-none"
                style={{
                  background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                }}
              />
              <Link
                href="/auth/signin"
                className="relative inline-flex items-center justify-center px-6 py-2 sm:py-2.5 text-base font-semibold text-black transition-all duration-200 bg-white rounded-lg sm:text-sm hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 z-10"
                role="button"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {expanded && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-1 pt-8 pb-4">
              <div className="grid gap-y-6">
                <a href="#features" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Features
                </a>
                <a href="#wellness" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Wellness
                </a>
                <a href="#community" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Community
                </a>
                <div className="relative">
                  <div className="absolute inset-0 z-0 rounded-lg blur-[40px] opacity-60 pointer-events-none"
                    style={{
                      background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                    }}
                  />
                  <Link
                    href="/auth/signin"
                    className="relative inline-flex items-center justify-center px-6 py-2 text-base font-semibold leading-7 text-black transition-all duration-200 bg-white border border-transparent rounded-lg hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 z-10"
                    role="button"
                  >
                    Join Community
                  </Link>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterContent />
      <ParallaxElements />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
};

const CenterContent = () => {
  const { scrollY } = useScroll();
  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(scrollY, [0, SECTION_HEIGHT + 500], ["170%", "100%"]);
  const opacity = useTransform(scrollY, [SECTION_HEIGHT, SECTION_HEIGHT + 500], [1, 0]);

  return (
    <motion.div
      className="sticky top-0 h-screen w-full flex items-center justify-center"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage: "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center bg-blue-100/90 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
        >
          🎉 Supporting 10,000+ students worldwide
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Your Safe Space for{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Student Wellbeing
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Connect anonymously with fellow students, access mental health resources, and build meaningful relationships in a privacy-first community.
        </motion.p>

        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center space-x-8"
        >
          <li className="flex items-center text-white/90">
            <FiCheck className="w-5 h-5 mr-2 text-green-400" />
            <span className="text-sm font-medium">100% Anonymous</span>
          </li>
          <li className="flex items-center text-white/90">
            <FiCheck className="w-5 h-5 mr-2 text-green-400" />
            <span className="text-sm font-medium">24/7 Support</span>
          </li>
        </motion.ul>
      </div>
    </motion.div>
  );
};

const ParallaxElements = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px]">
      <ParallaxCard
        title="Mental Health Support"
        description="Anonymous posting and peer support for anxiety, depression, and stress management."
        image="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=400&auto=format&fit=crop"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxCard
        title="Wellness Tracking"
        description="Monitor your mood, track stress patterns, and receive personalized wellness recommendations."
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=400&auto=format&fit=crop"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxCard
        title="Real-time Chat"
        description="Connect instantly with fellow students through secure, private messaging."
        image="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxCard
        title="Safe Community"
        description="Join a supportive community with human-moderated content and privacy protection."
        image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

interface ParallaxCardProps {
  className: string;
  title: string;
  description: string;
  image: string;
  start: number;
  end: number;
}

const ParallaxCard = ({ className, title, description, image, start, end }: ParallaxCardProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.div
      ref={ref}
      className={`${className} mb-16`}
      style={{ transform, opacity }}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};



interface FeatureProps {
  title: string;
  description: string;
  image: string;
  benefits: string[];
}

interface FeatureRowProps {
  feature: FeatureProps;
  index: number;
}

const FeatureRow = ({ feature, index }: FeatureRowProps) => {
  const isEven = index % 2 === 0;
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Create scroll-based transforms for swapping effect
  const imageX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1],
    isEven ? [200, 0, 0, -200] : [-200, 0, 0, 200]
  );
  const contentX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1],
    isEven ? [-200, 0, 0, 200] : [200, 0, 0, -200]
  );
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  return (
    <motion.div
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity }}
    >
      {/* Image Column with scroll-based movement */}
      <motion.div
        className="absolute w-1/2 h-96"
        style={{
          x: imageX,
          scale,
          left: isEven ? '0%' : '50%'
        }}
      >
        <div className="relative h-full">
          <motion.img
            src={feature.image}
            alt={feature.title}
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
      </motion.div>

      {/* Content Column with scroll-based movement */}
      <motion.div
        className="absolute w-1/2 h-96 flex items-center"
        style={{
          x: contentX,
          scale,
          left: isEven ? '50%' : '0%'
        }}
      >
        <div className={`${isEven ? 'pl-12' : 'pr-12'} w-full`}>
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            {feature.title}
          </h3>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {feature.description}
          </p>

          <div className="space-y-4 mb-8">
            {feature.benefits.map((benefit, benefitIndex) => (
              <div
                key={benefitIndex}
                className="flex items-center"
              >
                <div className={`w-3 h-3 rounded-full mr-4 ${isEven
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`} />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`font-semibold py-3 px-8 rounded-xl shadow-lg text-white ${isEven
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
          >
            Learn More
            <span className="inline-block ml-2">→</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};



export default HeroSection;