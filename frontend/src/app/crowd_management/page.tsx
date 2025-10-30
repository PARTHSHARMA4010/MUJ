"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UploadVideoContainer from "./UploadVideoContainer";
import VideoContainer from "./VideoContainer";
import { Loader2, Users, MapPin, Clock, BarChart3 } from "lucide-react";
import Image from "next/image";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { gsap } from "gsap";
import ThreeBackground from "./ThreeBackground";

const BACKEND_URL = process.env.NEXT_PUBLIC_COLLAB_PUBLIC_URL;
// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyAT4TBVLGRAvNUq8O177-JGiWuQadk3Pb0";

export default function CrowdManagementPage() {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<
    { second: number; max_debris_detected: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Mock data for dashboard metrics
  const metrics = {
    longitude: 77.1025,
    latitude: 28.7041
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")} min`;
  };

  useEffect(() => {
    // GSAP animations for page elements
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    timeline
      .fromTo(headerRef.current, 
        { y: -100, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8 }
      )
      .fromTo(titleRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(statsRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
        "-=0.3"
      )
      .fromTo(uploadRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      )
      .fromTo(timelineRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.4"
      );
      
    // Show map with delay
    setTimeout(() => {
      setShowMap(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!videoURL?.trim()) return;

    const fetchTimelineData = async () => {
      console.log("Request sent to:", `${BACKEND_URL}/video-count-population`);
      console.log("Request body:", { video_url: videoURL, metadata: {} });

      setIsLoading(true);

      try {
        const response = await fetch(`${BACKEND_URL}/video-count-population`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: videoURL, metadata: {} }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        // Transform data for timeline
        const transformedData = data.map((item: any) => ({
          second: item.second,
          max_debris_detected: item.max_debris_detected,
        }));

        setTimelineData(transformedData);
        
        // Animate timeline data appearance
        gsap.fromTo(
          ".timeline-item",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.03, duration: 0.5, ease: "back.out(1.7)" }
        );
        
      } catch (error) {
        console.error("Error fetching timeline data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineData();
  }, [videoURL]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Content Container - with higher z-index */}
      <div className="relative z-10">
        {/* Header */}
        <div ref={headerRef} className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-md border-b border-gray-700/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-blue-600 to-teal-400 p-2 rounded-lg shadow-lg mr-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-400 tracking-wider">ADVANCED ANALYTICS</div>
                  <h1 ref={titleRef} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                    Crowd Management & Analysis
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-300">Status: Active</span>
                </div>
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
                  <span className="text-sm font-medium text-gray-300">Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div ref={statsRef} className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Crowd Density Card */}
            <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Crowd Density</p>
                    <h3 className="text-2xl font-bold text-white">High</h3>
                    <p className="text-blue-400 text-xs mt-1">+12% from average</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Location Card */}
            <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Location</p>
                    <h3 className="text-2xl font-bold text-white">MUJ Campus</h3>
                    <p className="text-teal-400 text-xs mt-1">Main Entrance</p>
                  </div>
                  <div className="bg-teal-500/20 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Time Period Card */}
            <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Time Period</p>
                    <h3 className="text-2xl font-bold text-white">Peak Hours</h3>
                    <p className="text-purple-400 text-xs mt-1">9:00 AM - 11:00 AM</p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Analysis Status Card */}
            <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Analysis Status</p>
                    <h3 className="text-2xl font-bold text-white">Real-time</h3>
                    <p className="text-amber-400 text-xs mt-1">Updated 2 min ago</p>
                  </div>
                  <div className="bg-amber-500/20 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Video Upload Section */}
        <div ref={uploadRef} className="container mx-auto px-4 py-6">
          <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Upload Video for Crowd Analysis</h2>
              <UploadVideoContainer setVideoURL={setVideoURL} />
            </CardContent>
          </Card>
        </div>
        
        {/* Video and Timeline Section */}
        <div ref={timelineRef} className="container mx-auto px-4 py-6 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Container */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden h-full">
                <CardContent className="p-6 h-full">
                  <h2 className="text-xl font-bold text-white mb-4">Video Analysis</h2>
                  {videoURL ? (
                    <VideoContainer videoURL={videoURL} />
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                      <p className="text-gray-400">Upload a video to begin analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Timeline */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Timeline Card */}
                <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Crowd Density Timeline</h2>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                    ) : timelineData.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {timelineData.map((item, index) => (
                          <div 
                            key={index} 
                            className="timeline-item bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex justify-between items-center"
                          >
                            <div>
                              <span className="text-gray-400 text-sm">Time: </span>
                              <span className="text-white font-medium">{formatTime(item.second)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">Crowd: </span>
                              <span className={`font-medium ${
                                item.max_debris_detected > 20 ? 'text-red-400' : 
                                item.max_debris_detected > 10 ? 'text-amber-400' : 'text-green-400'
                              }`}>
                                {item.max_debris_detected} people
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                        <p className="text-gray-400">No timeline data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Map Card - Horizontal and Centered */}
          <div className="container mx-auto px-4 py-6 mb-10">
            <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border-gray-700/50 overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 text-center">Location</h2>
                
                {showMap ? (
                  <div className="h-60 rounded-lg overflow-hidden mx-auto">
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                      <Map
                        defaultCenter={{ lat: metrics.latitude, lng: metrics.longitude }}
                        defaultZoom={15}
                        mapId="crowd-management-map"
                        className="w-full h-full"
                      >
                        <AdvancedMarker position={{ lat: metrics.latitude, lng: metrics.longitude }}>
                          <div className="bg-blue-500 p-2 rounded-full animate-pulse">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-60 bg-gray-800/50 rounded-lg">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
