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
} from "phosphor-react";

export default function Home() {
  const mainRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroCTARef = useRef(null);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    // Hero section animations with smooth easing
    gsap.fromTo(
      heroTitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "sine.out", delay: 0.2 }
    );

    gsap.fromTo(
      heroDescRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: "sine.out", delay: 0.35 }
    );

    gsap.fromTo(
      heroCTARef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: "sine.out", delay: 0.5 }
    );

    // Animate feature cards on scroll
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
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  ease: "sine.out",
                  delay: index * 0.08,
                }
              );
            }
          });
        },
        { threshold: 0.1 }
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
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  ease: "sine.out",
                  delay: index * 0.1,
                }
              );
            }
          });
        },
        { threshold: 0.1 }
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
                entry.target,
                { opacity: 0, scale: 0.9 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.6,
                  ease: "sine.out",
                  delay: index * 0.06,
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
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f7]" ref={mainRef}>
      {/* Navigation */}
      <nav className="border-b border-[#e5e5e5] sticky top-0 z-50 bg-[#faf9f7]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-lg md:text-2xl font-bold text-black flex items-center gap-2">
            <div className="w-6 h-6 bg-[#8b6f47] rounded flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            AdMiro
          </Link>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="#features"
              className="text-base font-bold text-black hover:text-[#8b6f47] transition">
              Features
            </Link>
            <Link
              href="#howit"
              className="text-base font-bold text-black hover:text-[#8b6f47] transition">
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold bg-[#8b6f47] text-white rounded-lg hover:bg-[#6b5535] transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-32">
        <div className="max-w-3xl">
          <h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-black mb-6 md:mb-8"
            ref={heroTitleRef}>
            One platform. Zero complexity.
          </h1>
          <p
            className="text-base md:text-lg lg:text-xl text-gray-700 mb-8 md:mb-12 leading-relaxed max-w-2xl"
            ref={heroDescRef}>
            Manage digital displays and advertisements at scale. Push content in
            real-time, track performance, and grow your business—all from one
            intelligent dashboard.
          </p>

          <div className="flex gap-4 flex-wrap" ref={heroCTARef}>
            <Link
              href="/login"
              className="px-6 md:px-8 py-3 md:py-4 border-2 border-[#8b6f47] text-black font-bold rounded-lg hover:bg-[#f5f0e8] transition inline-flex items-center gap-2 text-base md:text-lg">
              Get started free
              <ArrowRight size={20} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-[#e5e5e5] bg-[#f5f0e8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-center text-base text-gray-600 mb-12 font-bold">
            Trusted by leading businesses
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-12 items-center justify-center">
            {["OpenAI", "Figma", "Stripe", "Vercel", "Notion"].map(company => (
              <div
                key={company}
                data-animate-logo
                className="text-center text-gray-700 font-bold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-32">
        <div className="mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
            Everything you need
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl">
            Complete control over your display network and advertising
            campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[
            {
              title: "Real-time Display Control",
              description:
                "Push content updates to all your displays instantly. Change what's displayed across your entire network with a single command.",
              icon: Monitor,
            },
            {
              title: "Advanced Analytics",
              description:
                "Track impressions, engagement, and conversion metrics in real-time. Understand what's working and optimize your campaigns.",
              icon: ChartBar,
            },
            {
              title: "Flexible Scheduling",
              description:
                "Schedule advertisements for specific times, dates, or recurring patterns. Automate your content rotation.",
              icon: Clock,
            },
            {
              title: "Multi-display Management",
              description:
                "Manage unlimited displays from a single dashboard. Group displays, apply bulk updates, and monitor health status.",
              icon: Stack,
            },
            {
              title: "Enterprise Security",
              description:
                "JWT authentication, role-based access control, encrypted connections, and compliance with modern security standards.",
              icon: Lock,
            },
            {
              title: "RESTful API",
              description:
                "Integrate with your existing systems using our comprehensive REST API. Build custom integrations tailored to your needs.",
              icon: Code,
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                data-animate-card
                className="p-6 md:p-8 border border-[#e5e5e5] rounded-xl hover:border-[#8b6f47] hover:shadow-lg transition">
                <div className="w-12 h-12 bg-[#f5f0e8] rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} weight="bold" className="text-[#8b6f47]" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="howit" className="bg-[#f5f0e8] border-y border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-32">
          <div className="mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
              How it works
            </h2>
            <p className="text-base md:text-lg text-gray-700">
              Get started in minutes with our simple 4-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              {
                step: "01",
                title: "Connect your displays",
                description:
                  "Register your Android displays in the dashboard. Each gets a unique ID for easy identification and management.",
              },
              {
                step: "02",
                title: "Create & manage ads",
                description:
                  "Upload images, videos, or create rich content. Set schedules and rotation rules for your advertisements.",
              },
              {
                step: "03",
                title: "Push & control",
                description:
                  "Deploy content across displays instantly. Update, pause, or rotate ads without any physical interaction.",
              },
              {
                step: "04",
                title: "Monitor & optimize",
                description:
                  "Track real-time analytics. See impressions, engagement metrics, and optimize based on performance data.",
              },
            ].map((item, i) => (
              <div key={i} data-animate-step className="flex gap-4 md:gap-8">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-lg bg-[#8b6f47] text-white font-bold text-base md:text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-xl font-bold text-black mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-32">
        <div className="bg-[#8b6f47] rounded-3xl p-8 md:p-16 lg:p-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6">
            Ready to simplify display management?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-amber-50 mb-8 md:mb-10 max-w-2xl mx-auto">
            Join teams managing thousands of displays worldwide. Start free,
            upgrade when you need more.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 md:px-10 md:py-4 bg-white text-[#8b6f47] rounded-lg font-semibold hover:bg-amber-50 transition text-sm md:text-base">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mb-8 md:mb-12">
            <div className="md:col-span-1">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <div className="w-5 h-5 bg-[#8b6f47] rounded flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                AdMiro
              </h3>
              <p className="text-sm text-gray-700">
                Digital display management for the modern business.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-black mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-black transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black transition">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black transition">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-black mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>
                  <Link href="#" className="hover:text-black transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-black mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>
                  <Link href="#" className="hover:text-black transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black transition">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black transition">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-700">
            <p>&copy; 2025 AdMiro. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-black transition">
                Twitter
              </Link>
              <Link href="#" className="hover:text-black transition">
                GitHub
              </Link>
              <Link href="#" className="hover:text-black transition">
                LinkedIn
              </Link>
              <Link href="#" className="hover:text-black transition">
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
