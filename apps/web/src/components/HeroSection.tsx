import React, { useState, useRef } from 'react';
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
      <StudentStories />
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
            <a
              href="#"
              className="inline-flex items-center justify-center px-6 py-2 sm:py-2.5 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:text-sm hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              role="button"
            >
              Join Community
            </a>
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
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 py-2 text-base font-semibold leading-7 text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                  role="button"
                >
                  Join Community
                </a>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg">
            Start Your Journey
          </button>
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-4 px-8 rounded-xl border-2 border-white/30 transition-all">
            Watch Demo
          </button>
        </motion.div>

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
        image="https://images.unsplash.com/photo-1506126613408-eca07ce68e71?q=80&w=400&auto=format&fit=crop"
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

const StudentStories = () => {
  const stories = [
    { title: "Overcoming Social Anxiety", author: "Sarah M.", category: "Mental Health" },
    { title: "Finding My Support Network", author: "Alex K.", category: "Community" },
    { title: "Stress Management Success", author: "Maya P.", category: "Wellness" },
    { title: "Academic Pressure Relief", author: "Jordan L.", category: "Academic" },
    { title: "International Student Journey", author: "Aisha R.", category: "Cultural" },
  ];

  return (
    <section
      id="student-stories"
      className="mx-auto max-w-5xl px-4 py-48 bg-white"
    >
      <motion.h2
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-20 text-4xl font-black text-gray-900 text-center"
      >
        Student Stories
      </motion.h2>

      {stories.map((story, index) => (
        <StoryItem
          key={index}
          title={story.title}
          author={story.author}
          category={story.category}
        />
      ))}
    </section>
  );
};

interface StoryItemProps {
  title: string;
  author: string;
  category: string;
}

const StoryItem = ({ title, author, category }: StoryItemProps) => {
  return (
    <motion.div
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.75 }}
      className="mb-9 flex items-center justify-between border-b border-gray-200 px-3 pb-9 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
      <div>
        <p className="mb-1.5 text-xl text-gray-900 font-semibold">{title}</p>
        <p className="text-sm text-gray-600">by {author}</p>
      </div>
      <div className="flex items-center gap-1.5 text-end text-sm text-blue-600 font-medium">
        <p>{category}</p>
        <FiArrowRight />
      </div>
    </motion.div>
  );
};

export default HeroSection;