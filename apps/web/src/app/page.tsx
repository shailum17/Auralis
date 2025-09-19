'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import StudentTestimonials from '@/components/StudentTestimonials';
import HeroSection from '@/components/HeroSection';


export default function Home() {

  const swapFeatures = [
    {
      title: "Anonymous Posting",
      description: "Share your thoughts and experiences without judgment. Post anonymously while maintaining complete privacy and safety.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      benefits: ["Complete anonymity", "Safe expression", "No judgment zone", "Privacy protection"]
    },
    {
      title: "AI-Powered Wellness",
      description: "Get personalized wellness recommendations powered by ethical AI that respects your privacy and helps you thrive.",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=600&auto=format&fit=crop",
      benefits: ["Personalized insights", "Privacy-first AI", "Stress pattern analysis", "Mood tracking"]
    },
    {
      title: "Peer Support Network",
      description: "Connect with fellow students who understand your journey. Build meaningful relationships in a supportive environment.",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop",
      benefits: ["24/7 peer support", "Study groups", "Mental health circles", "Academic guidance"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Navigation and Scroll Animations */}
      <HeroSection />

      {/* Features Section - Swap Scroll Column */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Student Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every feature is designed with privacy, safety, and mental health in mind
            </p>
          </motion.div>

          {swapFeatures.map((feature, index) => (
            <FeatureRow key={index} feature={feature} index={index} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of students in just a few clicks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Account</h3>
              <p className="text-gray-600">
                Sign up with just your email. We only collect what's necessary for your experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share & Connect</h3>
              <p className="text-gray-600">
                Post anonymously, join discussions, and connect with students who understand your journey.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Grow Together</h3>
              <p className="text-gray-600">
                Access wellness resources, track your mood, and build a supportive network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <StudentTestimonials />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Take the first step towards a more supportive student experience. Your privacy and wellbeing are our priority.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105">
              Get Started Free
            </button>
            <button className="bg-transparent hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-xl border-2 border-white transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <span className="text-xl font-bold">Student Community</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                A privacy-first platform designed to support student mental health and foster meaningful connections.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mental Health</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crisis Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Academic Help</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wellness Tips</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Report Issue</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Student Community Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface SwapFeatureProps {
  title: string;
  description: string;
  image: string;
  benefits: string[];
}

interface FeatureRowProps {
  feature: SwapFeatureProps;
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