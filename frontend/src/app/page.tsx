"use client"; // Added this line to enable client-side interactivity

import React from 'react';
// import Link from 'next/link'; // Removed this line as 'next/link' is not available in this environment.

// Replaced external icon with a local dummy image
const DroneIcon = () => (
  <img
    src="/eagle.webp" // Assuming 'eagle.png' is in your /public folder
    alt="Eagle Eye Icon"
    width="30"
    height="30"
    className="h-7 w-7" // Tailwind class to set height and width
  />
);

// Array of your navigation links to keep the component clean
const navLinks = [
  { href: "/home/", label: "" },
  { href: "/target_detection/", label: "Target Detection Mode" },
  { href: "/target_detection/demo/", label: "Demo cctv upload page" },
  { href: "/restricted_mode/", label: "Thermal Imaging" },
  { href: "/crowd_management/", label: "Debris Detection" },
];

export default function App() {
  return (
    // Main container: full screen, dark theme, and font
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans text-gray-200">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507542263155-337583B8D9c2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          // Fallback placeholder in case the image fails
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/1920x1080/0f172a/334155?text=Drone+Silhouette";
            e.currentTarget.onerror = null;
          }}
          alt="Drone silhouette"
          className="h-full w-full object-cover opacity-10"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      {/* Main content layout (column flex) */}
      <div className="relative z-10 flex h-full w-full flex-col">
        
        {/* Header Navigation */}
        <nav className="w-full flex-shrink-0 bg-slate-800/60 px-6 py-4 shadow-lg backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            
            {/* Left Side: Logo and Title */}
            <div className="flex items-center gap-3">
              <DroneIcon />
              <span className="text-xl font-bold text-white">
                Eagle Eye
              </span>
            </div>

            {/* Right Side: Navigation Links */}
            <div className="hidden items-center gap-2 md:flex">
              {navLinks.map((link) => (
                <a // Changed from Link to a standard <a> tag
                  href={link.href}
                  key={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  {link.label}
                </a> // Changed from Link to a
              ))}
            </div>
            
            {/* Mobile Menu Button (optional, for smaller screens) */}
            <div className="md:hidden">
              <button className="rounded-md p-2 text-gray-300 hover:bg-slate-700 hover:text-white">
                {/* Drone Icon for mobile menu */}
                <img
                  src="/drone.jpeg" // Changed from .png to .jpeg to match your file
                  alt="Menu Icon"
                  width="24"
                  height="24"
                  className="h-6 w-6" // Tailwind class to set height and width
                />
              </button>
            </div>

          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex flex-grow items-center justify-center p-6">
          {/* Container for the image, text, and button */}
          <div className="relative h-[60vh] w-full max-w-4xl transform overflow-hidden rounded-lg bg-slate-800/70 shadow-2xl backdrop-blur-lg transition-all hover:scale-[1.01]">
            {/* Background Image for main content */}
            <img
              src="https://images.unsplash.com/photo-1517976487592-16ee60c345b8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              onError={(e) => {
                e.currentTarget.src =
                  'https://placehold.co/1200x600/0f172a/334155?text=Drone+View';
                e.currentTarget.onerror = null;
              }}
              alt="Drone in flight"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />

            {/* Overlay for text and button */}
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-10 text-center">
              <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
                Eagle Eye Operations
              </h1>
              <p className="mb-8 text-lg text-gray-200 drop-shadow-md">
                Advanced Target Detection and Analysis.
              </p>
              <button className="rounded-md bg-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-cyan-400 hover:shadow-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75">
                Start
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}






