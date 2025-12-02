"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  Monitor,
  ChartBar,
  Clock,
  Stack,
  Lock,
  Code,
  ArrowRight,
  CaretUp,
  Lightning,
  Eye,
  Rocket,
  Shield,
  Sparkle,
  Play,
} from "phosphor-react";

export default function Home() {
  const mainRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroCTARef = useRef(null);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    // Hero section animations with dramatic entrance
    gsap.fromTo(
      heroTitleRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.1,
      }
    );

    gsap.fromTo(
      heroDescRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.4 }
    );

    gsap.fromTo(
      heroCTARef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.7 }
    );

    // Animated stats counter
    const statsInterval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 3);
    }, 3000);

    // Animate feature cards on scroll with stagger
    const featureCards = document.querySelectorAll("[data-animate-card]");
    featureCards.forEach((card, index) => {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting &&
              !entry.target.classList.contains("animated")
            ) {
              entry.target.classList.add("animated");
              gsap.fromTo(
                entry.target,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  ease: "power3.out",
                  delay: index * 0.1,
                }
              );
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(card);
    });

    // Animate how it works steps on scroll
    const steps = document.querySelectorAll("[data-animate-step]");
    steps.forEach((step, index) => {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting &&
              !entry.target.classList.contains("animated")
            ) {
              entry.target.classList.add("animated");
              gsap.fromTo(
                entry.target,
                { opacity: 0, x: index % 2 === 0 ? -30 : 30 },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.9,
                  ease: "power3.out",
                  delay: index * 0.15,
                }
              );
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(step);
    });

    // Animate trust section logos on scroll
    const logos = document.querySelectorAll("[data-animate-logo]");
    logos.forEach((logo, index) => {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting &&
              !entry.target.classList.contains("animated")
            ) {
              entry.target.classList.add("animated");
              gsap.fromTo(
                logo,
                { opacity: 0, scale: 0.8 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.7,
                  ease: "back.out(1.5)",
                  delay: index * 0.08,
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(logo);
    });

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f7] overflow-x-hidden" ref={mainRef}>
      {/* Navigation */}
      <nav className="border-b border-[#e5e5e5] sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-lg md:text-2xl font-bold text-black flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="w-7 h-7 bg-linear-to-br from-[#8b6f47] to-[#6b5535] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
              A
            </div>
            AdMiro
          </Link>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="#features"
              className="text-base font-bold text-black hover:text-[#8b6f47] transition-all hover:scale-105">
              Features
            </Link>
            <Link
              href="#howit"
              className="text-base font-bold text-black hover:text-[#8b6f47] transition-all hover:scale-105">
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-bold bg-linear-to-r from-[#8b6f47] to-[#6b5535] text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        data-hero-section
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-40 relative overflow-hidden bg-linear-to-br from-[#faf9f7] via-[#f5f0e8] to-[#faf9f7]">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#8b6f47]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b6f47]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8b6f47]/10 border border-[#8b6f47]/20 rounded-full mb-8">
            <Sparkle size={16} weight="fill" className="text-[#8b6f47]" />
            <span className="text-sm font-bold text-[#8b6f47]">
              Transforming Digital Signage
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight text-black mb-8"
            ref={heroTitleRef}>
            Display Management,{" "}
            <span className="bg-linear-to-r from-[#8b6f47] to-[#6b5535] bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p
            className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto font-medium"
            ref={heroDescRef}>
            Control thousands of displays from a single dashboard. Push updates
            instantly. Track every metric.
            <span className="block mt-2 text-[#8b6f47] font-bold">
              It's digital signage that just works.
            </span>
          </p>

          <div
            className="flex gap-4 flex-wrap justify-center items-center"
            ref={heroCTARef}>
            <Link
              href="/login"
              className="group px-8 md:px-10 py-4 md:py-5 bg-linear-to-r from-[#8b6f47] to-[#6b5535] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3 text-base md:text-lg">
              Start Free Today
              <ArrowRight
                size={24}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="#howit"
              className="group px-8 md:px-10 py-4 md:py-5 border-2 border-[#e5e5e5] text-black font-bold rounded-xl hover:border-[#8b6f47] hover:bg-[#f5f0e8] transition-all inline-flex items-center gap-3 text-base md:text-lg">
              <Play size={24} weight="fill" className="text-[#8b6f47]" />
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "<100ms", label: "Response Time" },
              { value: "∞", label: "Displays" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  currentStat === i ? "scale-110" : "scale-100 opacity-70"
                }`}>
                <div className="text-2xl md:text-4xl font-extrabold text-[#8b6f47]">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-[#e5e5e5] bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Shield size={32} weight="bold" className="text-[#8b6f47]" />
              <div>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                  Enterprise Ready
                </p>
                <p className="text-lg font-bold text-black">
                  Trusted by industry leaders
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-12 items-center">
              {["OpenAI", "Figma", "Stripe", "Vercel", "Notion"].map(
                (company, i) => (
                  <div
                    key={company}
                    data-animate-logo
                    className="text-center text-gray-600 font-extrabold text-base md:text-lg hover:text-[#8b6f47] transition-all cursor-default hover:scale-110">
                    {company}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-40">
        <div className="mb-16 md:mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8b6f47]/10 border border-[#8b6f47]/20 rounded-full mb-6">
            <Lightning size={16} weight="fill" className="text-[#8b6f47]" />
            <span className="text-sm font-bold text-[#8b6f47]">
              Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-6">
            Built for{" "}
            <span className="bg-linear-to-r from-[#8b6f47] to-[#6b5535] bg-clip-text text-transparent">
              scale
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Everything you need to run a world-class display network. No
            compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: "Lightning Fast Updates",
              description:
                "Push content changes to thousands of displays in under 100ms. Real-time synchronization that actually works.",
              icon: Lightning,
              color: "from-purple-500 to-purple-700",
            },
            {
              title: "Deep Analytics",
              description:
                "Track impressions, dwell time, and engagement across every display. Make data-driven decisions.",
              icon: ChartBar,
              color: "from-blue-500 to-blue-700",
            },
            {
              title: "Infinite Scale",
              description:
                "From 1 to 10,000+ displays. Our infrastructure grows with you. No performance degradation.",
              icon: Stack,
              color: "from-green-500 to-green-700",
            },
            {
              title: "Enterprise Security",
              description:
                "JWT auth, encrypted connections, SOC 2 compliant. Your content is protected at every layer.",
              icon: Lock,
              color: "from-red-500 to-red-700",
            },
            {
              title: "Developer API",
              description:
                "Complete REST API with webhooks. Build custom integrations and automate everything.",
              icon: Code,
              color: "from-orange-500 to-orange-700",
            },
            {
              title: "Real-time Monitoring",
              description:
                "Instant alerts when displays go offline. Health monitoring dashboard with 99.9% uptime guarantee.",
              icon: Eye,
              color: "from-teal-500 to-teal-700",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                data-animate-card
                className="group relative p-8 border-2 border-[#e5e5e5] rounded-2xl hover:border-[#8b6f47] hover:shadow-2xl transition-all bg-white overflow-hidden">
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-[#8b6f47]/0 to-[#8b6f47]/0 group-hover:from-[#8b6f47]/5 group-hover:to-transparent transition-all"></div>

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon size={28} weight="bold" className="text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-black mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature highlight */}
        <div className="mt-16 p-8 md:p-12 bg-linear-to-br from-[#8b6f47] to-[#6b5535] rounded-3xl text-white text-center shadow-2xl">
          <Rocket size={48} weight="bold" className="mx-auto mb-6" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
            Deploy in Minutes, Not Days
          </h3>
          <p className="text-lg text-amber-50 max-w-2xl mx-auto">
            No complex setup. No hardware to configure. Just connect your
            displays and start broadcasting. It's that simple.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="howit"
        className="bg-[#f5f0e8] border-y border-[#e5e5e5] relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b6f47]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8b6f47]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-40 relative z-10">
          <div className="mb-16 md:mb-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-[#8b6f47]/20 rounded-full mb-6">
              <Rocket size={16} weight="fill" className="text-[#8b6f47]" />
              <span className="text-sm font-bold text-[#8b6f47]">
                Simple Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-6">
              Go live in{" "}
              <span className="bg-linear-to-r from-[#8b6f47] to-[#6b5535] bg-clip-text text-transparent">
                4 simple steps
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              From zero to deployed in under 10 minutes. No technical expertise
              required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {[
              {
                step: "01",
                title: "Connect Displays",
                description:
                  "Register your displays with a secure token. Each gets a unique ID. Works with any device—TVs, tablets, or monitors.",
                icon: Monitor,
              },
              {
                step: "02",
                title: "Upload Content",
                description:
                  "Drag and drop your images and videos. Create advertising loops with custom rotation settings. Supports all major formats.",
                icon: Stack,
              },
              {
                step: "03",
                title: "Deploy Instantly",
                description:
                  "Assign loops to displays with one click. Content goes live in under 100ms. Update remotely anytime, from anywhere.",
                icon: Lightning,
              },
              {
                step: "04",
                title: "Track Performance",
                description:
                  "Monitor display health in real-time. View analytics, uptime stats, and engagement metrics. Get instant offline alerts.",
                icon: Eye,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  data-animate-step
                  className="flex gap-6 bg-white p-8 rounded-2xl border-2 border-transparent hover:border-[#8b6f47] shadow-lg hover:shadow-2xl transition-all group">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-linear-to-br from-[#8b6f47] to-[#6b5535] text-white font-extrabold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon
                        size={28}
                        weight="bold"
                        className="text-[#8b6f47]"
                      />
                      <h3 className="text-xl md:text-2xl font-extrabold text-black">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-40">
        <div className="relative bg-linear-to-br from-[#8b6f47] to-[#6b5535] rounded-3xl p-12 md:p-20 lg:p-28 text-center overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <Sparkle size={16} weight="fill" className="text-white" />
              <span className="text-sm font-bold text-white">
                Join Thousands of Happy Users
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-6 md:mb-8">
              Ready to transform your{" "}
              <span className="block mt-2">display network?</span>
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl text-amber-50 mb-10 md:mb-14 max-w-3xl mx-auto leading-relaxed">
              Start free. No credit card required. Upgrade only when you're
              ready to scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="group px-10 py-5 bg-white text-[#8b6f47] rounded-xl font-extrabold hover:bg-amber-50 hover:scale-105 transition-all text-lg shadow-2xl inline-flex items-center gap-3">
                Get Started Now
                <ArrowRight
                  size={24}
                  weight="bold"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="#features"
                className="px-10 py-5 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 hover:border-white transition-all text-lg backdrop-blur-sm">
                Explore Features
              </Link>
            </div>

            <p className="mt-8 text-sm text-amber-100">
              ✓ Free forever plan • ✓ No credit card • ✓ 5-minute setup
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link
                href="/"
                className="font-bold text-black mb-4 inline-flex items-center gap-2 hover:scale-105 transition-transform">
                <div className="w-6 h-6 bg-linear-to-br from-[#8b6f47] to-[#6b5535] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
                  A
                </div>
                <span className="text-xl">AdMiro</span>
              </Link>
              <p className="text-sm text-gray-700 mt-4 leading-relaxed max-w-xs">
                The most powerful digital display management platform. Built for
                scale, designed for simplicity.
              </p>
              <div className="flex gap-4 mt-6">
                <Link
                  href="https://10eti.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[#f5f0e8] hover:bg-[#8b6f47] hover:text-white transition-all flex items-center justify-center font-bold text-xs">
                  WEB
                </Link>
                <Link
                  href="https://github.com/HemanthTenneti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[#f5f0e8] hover:bg-[#8b6f47] hover:text-white transition-all flex items-center justify-center font-bold text-sm">
                  GH
                </Link>
                <Link
                  href="https://www.linkedin.com/in/hemanth10eti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[#f5f0e8] hover:bg-[#8b6f47] hover:text-white transition-all flex items-center justify-center font-bold text-sm">
                  LI
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-black mb-4 text-sm uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold text-black mb-4 text-sm uppercase tracking-wide">
                Company
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold text-black mb-4 text-sm uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-[#8b6f47] transition font-medium">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-700 font-medium">
              &copy; 2025 AdMiro. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Built with ❤️ for the future of digital signage
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
