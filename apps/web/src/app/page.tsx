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

      {/* How It Works - Template Design */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The only platform that creates unique & supportive student communities
            </h2>
          </motion.div>

          {/* Three Column Layout */}
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Column 1: Create & Connect */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 z-0 rounded-2xl blur-[40px] opacity-90 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl p-6 shadow-xl z-10"
                >
                  <div className="text-xs text-gray-500 mb-4 text-left font-medium">STUDENTS</div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">JW</span>
                      </div>
                      <span className="text-gray-800 font-medium">Jenny Wilson</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">CF</span>
                      </div>
                      <span className="text-gray-800 font-medium">Cody Fisher</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">RF</span>
                      </div>
                      <span className="text-gray-800 font-medium">Robert Fox</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">SN</span>
                      </div>
                      <span className="text-gray-800 font-medium">Savannah Nguyen</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">FM</span>
                      </div>
                      <span className="text-gray-800 font-medium">Floyd Miles</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-gray-900 mb-4"
              >
                Create Your Profile & Connect
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-gray-600 leading-relaxed"
              >
                Start your journey in minutes. Create a profile, share interests, and connect with peers. Post thoughts anonymously or with your profile - it's always your choice. Join discussions and build meaningful relationships.
              </motion.p>
            </motion.div>

            {/* Column 2: Share & Support */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 z-0 rounded-2xl blur-[40px] opacity-90 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl p-6 shadow-xl z-10"
                >
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">AF</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800">Albert Flores</div>
                        <div className="text-xs text-gray-600 mt-1">Thanks for the awesome feedback! We are trying to implement this in our next update. Cheers!</div>
                        <div className="text-xs text-gray-400 mt-2">7 hours ago • Reply</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">EP</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800">Eleanor Pena</div>
                        <div className="text-xs text-gray-600 mt-1">@Albert Flores That would be great!</div>
                        <div className="text-xs text-gray-400 mt-2">5 hours ago • Reply</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-gray-900 mb-4"
              >
                Share & Get Support
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-gray-600 leading-relaxed"
              >
                Explore community forums with topic tags like #study-tips or #dorm-life. Our AI works silently to understand the community's emotional pulse and provides gentle, private support when needed.
              </motion.p>
            </motion.div>

            {/* Column 3: Track & Thrive */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 z-0 rounded-2xl blur-[40px] opacity-90 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="relative bg-gray-900 rounded-2xl p-6 text-white shadow-xl z-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Insight</div>
                    <div className="text-yellow-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-2">You have made $37,492 this week!</div>
                  <div className="text-sm text-gray-300 mb-4">Wellness Report</div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs text-gray-400">78%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Wellness & Resources</h3>
              <p className="text-gray-600 leading-relaxed">
                Access our curated Resource Library anytime - articles, videos, and professional contacts. Build your social network, send direct messages, and create study groups that support your academic success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <StudentTestimonials />

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-4xl font-bold text-gray-900">
              Join
            </h2>
            <div className="mx-3">
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Student Community
            </h2>
          </div>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            With lots of unique features, you can easily build a supportive network without judgment. Build your next chapter of student life.
          </p>

          {/* Email Signup Form with Colorful Shadow */}
          <div className="relative max-w-2xl mx-auto mb-8">
            {/* Colorful gradient shadow behind input field */}
            <div className="absolute inset-0 z-0 rounded-2xl blur-[40px] opacity-60 pointer-events-none"
              style={{
                background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
              }}
            />
            
            <div className="relative bg-white rounded-2xl p-2 shadow-lg border border-gray-200 z-10">
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 text-gray-700 placeholder-gray-500 bg-transparent border-none outline-none text-lg"
                />
                <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105">
                  Get started now
                </button>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            No ads. No trails. No commitments
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Auralis</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Empowering students through AI-powered wellness, productivity, and community features designed for academic success.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">AI-Powered Chat</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Wellness Tracking</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Study Groups</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Academic Analytics</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Resource Sharing</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Stay Updated</h4>
              <p className="text-gray-600 text-sm mb-3">
                Get the latest updates on new features and student resources.
              </p>
              
              {/* Newsletter Form with Gradient Background */}
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-sm opacity-70" style={{
                  background: 'linear-gradient(90deg, #a7f3d0 0%, #bfdbfe 25%, #ddd6fe 50%, #f3e8ff 75%, #fde68a 100%)'
                }}></div>
                <div className="relative bg-white rounded-lg p-1">
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-500 bg-transparent border-none outline-none"
                    />
                    <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 text-sm text-center">
              © 2024 Auralis. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
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