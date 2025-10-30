"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Activity, Eye, Thermometer, Scan } from 'lucide-react';

const DroneIcon = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 animate-pulse"></div>
    <Eye className="relative h-7 w-7 text-cyan-400" />
  </div>
);

const navLinks = [
  { href: "/target_detection/", label: "Target Detection", icon: Scan },
  { href: "/target_detection/demo/", label: "CCTV Upload", icon: Activity },
  { href: "/restricted_mode/", label: "Thermal Imaging", icon: Thermometer },
  { href: "/crowd_management/", label: "Debris Detection", icon: Eye },
];

const stats = [
  { label: "Active Drones", value: "12", trend: "+3" },
  { label: "Targets Detected", value: "247", trend: "+18" },
  { label: "Coverage Area", value: "45km²", trend: "+5.2" },
  { label: "System Status", value: "Optimal", trend: "100%" },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

 useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans text-gray-200">
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
             }}>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-500 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className={`relative z-10 flex h-full w-full flex-col transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header Navigation */}
        <nav className="w-full flex-shrink-0 border-b border-cyan-500/10 bg-slate-900/80 px-6 py-4 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <DroneIcon />
              <div>
                <span className="text-xl font-bold text-white tracking-tight">
                  Eagle Eye
                </span>
                <div className="flex items-center gap-2 text-xs text-cyan-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Active</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-2 lg:flex">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    href={link.href}
                    key={link.href}
                    className="group relative rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-300 hover:text-white"
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-300 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 group-hover:opacity-100"></div>
                    <div className="relative flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </div>
                  </a>
                );
              })}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-gray-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 space-y-2 border-t border-cyan-500/10 pt-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    href={link.href}
                    key={link.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20"
                  style={{
                    animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  <div className="absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-cyan-500/10 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative">
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <span className="text-xs text-green-400 font-medium">{stat.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hero Section */}
            <div 
              className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl backdrop-blur-xl"
              style={{
                animation: 'slideUp 0.8s ease-out 0.4s both',
              }}
            >
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 opacity-0 blur transition-opacity duration-500 group-hover:opacity-20"></div>
              
              <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">
                {/* Left Content */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    Advanced AI-Powered Surveillance
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Eagle Eye
                    <br />
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Operations Center
                    </span>
                  </h1>
                  
                  <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
                    Real-time target detection, thermal imaging, and debris analysis powered by next-generation AI surveillance technology.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105">
                      <span className="relative z-10 flex items-center gap-2">
                        Start Mission
                        <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </button>
                    
                    <button className="rounded-xl border border-cyan-500/30 bg-slate-800/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/80">
                      View Documentation
                    </button>
                  </div>
                </div>

                {/* Right Content - Feature Cards */}
                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                  {navLinks.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <a
                        href={link.href}
                        key={idx}
                        onMouseEnter={() => setActiveCard(idx)}
                        onMouseLeave={() => setActiveCard(null)}
                        className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/40 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 ${activeCard === idx ? 'opacity-100' : ''}`}></div>
                        <div className="relative space-y-3">
                          <div className="flex items-center justify-between">
                            <Icon className="h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                            <ChevronRight className="h-5 w-5 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-400" />
                          </div>
                          <p className="text-sm font-medium text-white">{link.label}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}