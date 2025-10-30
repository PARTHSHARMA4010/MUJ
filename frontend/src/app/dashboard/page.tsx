"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import UploadVideoContainer from "@/app/crowd_management/UploadVideoContainer";
import VideoContainer from "@/app/crowd_management/VideoContainer";
import UploadTargetImageContainer from "@/components/target-upload/UploadTargetImageContainer";
import UploadDescriptionContainer from "@/components/target-upload/UploadDescriptionContainer";
import TargetMapLocation from "@/components/map/TargetMapLocation";
import LocationList from "@/components/target-location/LocationList";
import StatusLegends from "@/app/target_detection/StatusLegends";
import { TargetLocation } from "@/types/interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BellRing, Video, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

// Lightweight Three.js background
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const BACKEND_URL = process.env.NEXT_PUBLIC_COLLAB_PUBLIC_URL;

export default function DashboardPage() {
  // Target search state
  const [targetFoundAt, setTargetFoundAt] = useState<TargetLocation[]>([]);

  // Video upload + crowd analytics state (reuse existing API contract)
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<
    { second: number; max_debris_detected: number }[]
  >([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Derived metrics
  const totalPeopleDetected = useMemo(
    () => timelineData.reduce((acc, cur) => acc + (cur.max_debris_detected || 0), 0),
    [timelineData]
  );
  const peakPeopleDetected = useMemo(
    () => (timelineData.length ? Math.max(...timelineData.map((t) => t.max_debris_detected)) : 0),
    [timelineData]
  );

  // Use latest detection as a quick coordinate readout if available
  const latestDetection = useMemo(() => {
    if (!targetFoundAt.length) return null;
    const sorted = [...targetFoundAt].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sorted[0];
  }, [targetFoundAt]);

  // Convert TargetLocation[] Date->number timestamps for map component
  const mapPoints = useMemo(
    () =>
      targetFoundAt.map((loc) => ({
        timestamp: new Date(loc.timestamp).getTime(),
        coordinates: loc.coordinates,
        cctv_id: loc.cctv_id,
        location_name: loc.location_name,
      })),
    [targetFoundAt]
  );

  // Fetch crowd timeline when video URL available (API unchanged)
  useEffect(() => {
    if (!videoURL?.trim()) return;

    const fetchTimeline = async () => {
      setIsLoadingTimeline(true);
      try {
        const response = await fetch(`${BACKEND_URL}/video-count-population`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: videoURL, metadata: {} }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const transformed = data.map((item: any) => ({
          second: item.second,
          max_debris_detected: item.max_debris_detected,
        }));
        setTimelineData(transformed);
      } catch (e) {
        console.error("Error fetching timeline:", e);
      } finally {
        setIsLoadingTimeline(false);
      }
    };

    fetchTimeline();
  }, [videoURL]);

  // GSAP: section reveals and parallax accents
  const heroRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const rightRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out" }
        );
      }
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 80%",
            },
          }
        );
      }
      if (rightRailRef.current) {
        gsap.fromTo(
          rightRailRef.current,
          { x: 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: rightRailRef.current, start: "top 85%" },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // Three.js animated background (very lightweight points field)
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const mount = threeMountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 8;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.02, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let raf = 0;
    const animate = () => {
      points.rotation.y += 0.0015;
      points.rotation.x += 0.0008;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  // Helpers
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")} min`;
  };

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Three background */}
      <div ref={threeMountRef} className="pointer-events-none absolute inset-0 opacity-40" />

      {/* Hero */}
      <div ref={heroRef} className="relative z-10 container mx-auto px-4 py-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
            <Video className="h-5 w-5 text-sky-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Unified Surveillance Dashboard</h1>
          <Badge className="ml-auto bg-emerald-600/30 border-emerald-400/30 text-emerald-200">Live</Badge>
        </div>
        {targetFoundAt.length > 0 ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-200 border border-emerald-400/20 px-4 py-2 rounded-lg">
            <BellRing className="h-5 w-5" />
            <span className="font-semibold">Target Found</span>
            {latestDetection ? (
              <span className="text-emerald-300/90">
                at {latestDetection.location_name} (CCTV {latestDetection.cctv_id})
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-200 border border-amber-400/20 px-4 py-2 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">No target found yet</span>
            <span className="text-amber-300/90">Upload image or description to search</span>
          </div>
        )}
      </div>

      <Separator className="opacity-10" />

      {/* Main layout */}
      <div className="relative z-10 container mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[340px_1fr_360px] gap-6">
        {/* Left rail: Upload panels */}
        <div className="flex flex-col gap-4">
          <Card className="bg-gray-900/60 border-gray-800/80 backdrop-blur">
            <div className="px-5 pt-4">
              <h2 className="font-semibold text-lg">Target Inputs</h2>
            </div>
            <CardContent className="grid gap-4 p-5">
              <UploadTargetImageContainer setTargetFoundAt={setTargetFoundAt} />
              <UploadDescriptionContainer setTargetFoundAt={setTargetFoundAt} />
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800/80 backdrop-blur">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Drone Footage</h2>
            </div>
            <CardContent className="p-5">
              <UploadVideoContainer setVideoURL={setVideoURL} />
            </CardContent>
          </Card>
        </div>

        {/* Center: Video + Map */}
        <div ref={gridRef} className="flex flex-col gap-6">
          <Card className="bg-black border-gray-800/80 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Live Video Preview</h2>
              {videoURL ? (
                <Badge variant="outline" className="border-sky-400/40 text-sky-300">Ready</Badge>
              ) : (
                <Badge variant="outline" className="border-gray-600 text-gray-400">Idle</Badge>
              )}
            </div>
            <CardContent className="p-0">
              <VideoContainer videoURL={videoURL} />
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800/80">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2"><MapPin className="h-5 w-5" />Detections Map</h2>
              {latestDetection ? (
                <div className="text-sm text-sky-300/90">
                  Latest: {latestDetection.coordinates.lat.toFixed(4)}, {latestDetection.coordinates.lng.toFixed(4)}
                </div>
              ) : null}
            </div>
            <CardContent className="p-0">
              <div className="relative">
                <TargetMapLocation target_found_at={mapPoints} />
                <LocationList target_found_at={targetFoundAt} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail: Metrics & Timeline */}
        <div ref={rightRailRef} className="flex flex-col gap-6">
          <Card className="bg-gray-900/60 border-gray-800/80 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Drone Snapshot</h2>
              <Badge variant="outline" className="border-sky-400/30 text-sky-300">Live Asset</Badge>
            </div>
            <CardContent className="p-0">
              <div className="relative w-full h-48 md:h-56 lg:h-56">
                <Image
                  src="/drone.jpeg"
                  alt="Search-and-rescue drone"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur px-3 py-2 text-xs flex items-center justify-between">
                  <span className="text-gray-200">UAV feed placeholder</span>
                  <span className="text-sky-300">Imagery + voice-guided search</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800/80">
            <div className="px-5 pt-4">
              <h2 className="font-semibold text-lg">People Detection</h2>
            </div>
            <CardContent className="p-5 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-4">
                <div className="text-sm text-emerald-300/80">Total Count</div>
                <div className="text-2xl font-bold text-emerald-200">{totalPeopleDetected}</div>
              </div>
              <div className="rounded-lg border border-sky-400/20 bg-sky-500/10 p-4">
                <div className="text-sm text-sky-300/80">Peak</div>
                <div className="text-2xl font-bold text-sky-200">{peakPeopleDetected}</div>
              </div>
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-4 col-span-2">
                <div className="text-sm text-amber-300/80">Latest Coordinates</div>
                <div className="text-base font-medium text-amber-200">
                  {latestDetection
                    ? `${latestDetection.coordinates.lat.toFixed(4)}, ${latestDetection.coordinates.lng.toFixed(4)}`
                    : "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800/80 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Detection Timeline</h2>
              {isLoadingTimeline ? (
                <Badge variant="outline" className="border-amber-400/30 text-amber-300">Processing</Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-400/30 text-emerald-300">Updated</Badge>
              )}
            </div>
            <CardContent className="p-4 max-h-[280px] overflow-y-auto space-y-2">
              {timelineData.length ? (
                timelineData.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-md bg-gray-800/70 border border-gray-700/60 flex items-center justify-between">
                    <div className="text-xs text-gray-300">{formatTime(t.second)}</div>
                    <div className="text-sm font-semibold text-sky-300">{t.max_debris_detected} persons</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">Upload a video to view timeline.</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800/80">
            <div className="px-5 pt-4">
              <h2 className="font-semibold text-lg">Status Legend</h2>
            </div>
            <CardContent>
              <StatusLegends />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" className="border-gray-700 text-gray-300">Refresh</Button>
            <span className="text-xs text-gray-500">APIs unchanged; reading live from backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}


