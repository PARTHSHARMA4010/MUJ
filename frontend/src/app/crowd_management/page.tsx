"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import UploadVideoContainer from "./UploadVideoContainer";
import VideoContainer from "./VideoContainer";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";

const BACKEND_URL = process.env.NEXT_PUBLIC_COLLAB_PUBLIC_URL;
// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyAT4TBVLGRAvNUq8O177-JGiWuQadk3Pb0";

export default function DebrisDetectionPage() {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<
    { second: number; max_debris_detected: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

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
      } catch (error) {
        console.error("Error fetching timeline data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineData();
  }, [videoURL]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-2 rounded-lg shadow-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-teal-400 tracking-wider">PROFESSIONAL PLATFORM</div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Debris Detection & Analysis
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 flex items-center">
                <div className="h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-300">Status: Active</span>
              </div>
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
                <span className="text-sm font-medium text-gray-300">Date: 10/30/2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Full width column for all content */}
          <div className="space-y-6">
            {/* Live drone feed */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-gray-800 to-gray-750 py-3 px-5 border-b border-gray-700/30">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold tracking-wide">LIVE DRONE VIDEO FEED</span>
                </h2>
              </div>
              <CardContent className="p-0">
                <VideoContainer videoURL={videoURL} />
              </CardContent>
            </Card>

            {/* Upload drone footage */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-gray-800 to-gray-750 py-3 px-5 border-b border-gray-700/30">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-semibold tracking-wide">UPLOAD DRONE FOOTAGE</span>
                </h2>
              </div>
              <CardContent className="p-5 bg-black/10">
                <UploadVideoContainer setVideoURL={setVideoURL} />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Metrics */}
          <div className="space-y-6">
            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* Longitude */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
                <CardContent className="p-5 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 mb-3 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-4 border-teal-500/20"></div>
                    <div className="absolute top-6 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div className="absolute bottom-4 w-full flex flex-col items-center justify-center">
                      <div className="text-center">
                        <span className="text-xl font-bold text-white">{metrics.longitude.toFixed(4)}</span>
                        <div className="text-xs text-teal-300 font-medium mt-1">LONGITUDE</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Longitude</h3>
                  </div>
                </CardContent>
              </Card>

              {/* Latitude */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
                <CardContent className="p-5 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 mb-3 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-4 border-amber-500/20"></div>
                    <div className="absolute top-6 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-4 w-full flex flex-col items-center justify-center">
                      <div className="text-center">
                        <span className="text-xl font-bold text-white">{metrics.latitude.toFixed(4)}</span>
                        <div className="text-xs text-amber-300 font-medium mt-1">LATITUDE</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Latitude</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 gap-6">
              {/* Timeline */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-300"></div>
                <div className="bg-gradient-to-r from-gray-800 to-gray-750 py-3 px-5 border-b border-gray-700/30">
                  <h2 className="text-lg font-medium text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-semibold tracking-wide">DETECTION TIMELINE</span>
                  </h2>
                </div>
                <CardContent className="p-4 max-h-[200px] overflow-y-auto bg-black/10">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24 bg-gray-900/30 rounded-lg border border-gray-700/30">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                      <span className="ml-2 text-teal-400 text-sm font-medium">Processing data...</span>
                    </div>
                  ) : timelineData.length > 0 ? (
                    timelineData.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-800/80 rounded-lg shadow-md mb-2 border-l-3 border-teal-500 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-teal-500 mr-2"></div>
                            <span className="text-gray-300 text-xs font-medium">
                              {formatTime(item.second)}
                            </span>
                          </div>
                          <span className="text-teal-300 font-semibold text-sm bg-teal-900/30 px-2 py-0.5 rounded">
                            {item.max_debris_detected} debris
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center bg-gray-900/30 rounded-lg border border-gray-700/30 py-8 px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-gray-400 font-medium">No data available</div>
                      <div className="text-gray-500 text-sm mt-1">Upload a video to see debris analysis</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Google Maps */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-850 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-300"></div>
              <div className="bg-gradient-to-r from-gray-800 to-gray-750 py-3 px-5 flex justify-between items-center border-b border-gray-700/30">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="font-semibold tracking-wide">LOCATION MAP</span>
                </h2>
                <div className="bg-gray-900/30 px-3 py-1 rounded-lg border border-gray-700/50 flex items-center">
                  <span className="text-sm font-medium text-gray-300">Coordinates: </span>
                  <span className="text-sm font-bold text-teal-300 ml-1">{metrics.longitude.toFixed(4)}, {metrics.latitude.toFixed(4)}</span>
                </div>
              </div>
              <CardContent className="p-0 h-[400px] bg-gray-800">
                <div className="w-full h-full">
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                      style={{ width: "100%", height: "100%", zIndex: 1 }}
                      defaultCenter={{ lat: metrics.latitude, lng: metrics.longitude }}
                      defaultZoom={15}
                      gestureHandling="greedy"
                      disableDefaultUI={true}
                      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "2e0ddee4c610d77b"}
                      reuseMaps={true}
                    >
                      {/* Using the same marker style from the provided code */}
                      <AdvancedMarker position={{ lat: metrics.latitude, lng: metrics.longitude }}>
                        <div className="relative flex items-center justify-center">
                          <div
                            className="absolute w-full h-full rounded-full opacity-50 animate-ping"
                            style={{
                              width: `36px`,
                              height: `36px`,
                              backgroundColor: "#FF3B30",
                            }}
                          />
                          <div
                            className="relative flex items-center justify-center text-white font-bold border-2 rounded-full"
                            style={{
                              width: `24px`,
                              height: `24px`,
                              backgroundColor: "#FF3B30",
                              borderColor: "#B71C1C",
                              fontSize: "14px",
                            }}
                          >
                            1
                          </div>
                        </div>
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
