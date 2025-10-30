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
  const [personFoundFromVideo, setPersonFoundFromVideo] = useState<null | boolean>(null);
  const [droneLatInput, setDroneLatInput] = useState<string>("");
  const [droneLonInput, setDroneLonInput] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [audioAnalysis, setAudioAnalysis] = useState<
    { timestamp: number; speech_ratio: number; label?: string }[]
  >([]);

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
        setFetchError(null);
        if (!BACKEND_URL) {
          console.error("NEXT_PUBLIC_COLLAB_PUBLIC_URL is not set");
          setTimelineData([]);
          setFetchError("Backend URL missing");
          return;
        }
        if (!/^https?:\/\//i.test(BACKEND_URL)) {
          console.error("Invalid BACKEND_URL, must include protocol (http/https):", BACKEND_URL);
          setTimelineData([]);
          setFetchError("Invalid backend URL (missing protocol)");
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        // Use Next.js API proxy to avoid CORS and ensure backend reachability
        const response = await fetch(`${BACKEND_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: videoURL,
            metadata: {
              // pass-through of optional lat/lon provided by user
              lat: droneLatInput ? Number(droneLatInput) : undefined,
              lon: droneLonInput ? Number(droneLonInput) : undefined,
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          // Attempt to surface upstream error details from proxy
          let errText = "";
          try {
            const maybeJson = await response.json();
            errText = typeof maybeJson === "object" ? (maybeJson.error || JSON.stringify(maybeJson)) : String(maybeJson);
            if (maybeJson?.details) {
              errText += ` | details: ${typeof maybeJson.details === "string" ? maybeJson.details : JSON.stringify(maybeJson.details)}`;
            }
            if (maybeJson?.triedPaths) {
              errText += ` | tried: ${maybeJson.triedPaths.join(", ")}`;
            }
          } catch {
            try {
              errText = await response.text();
            } catch {
              errText = "";
            }
          }
          throw new Error(`HTTP ${response.status}${errText ? ` - ${errText}` : ""}`);
        }
        let data: any;
        try {
          data = await response.json();
        } catch (parseErr) {
          const raw = await response.text();
          console.warn("Non-JSON response from video-count-population:", raw);
          setTimelineData([]);
          setPersonFoundFromVideo(null);
          setFetchError("Non-JSON response from backend");
          return;
        }

        // If backend returns the new object shape with human_detected and lat/lon
        if (data && typeof data === "object" && ("human_detected" in data)) {
          const hd = (data as any).human_detected;
          const detected = hd === true || hd === "true";
          setPersonFoundFromVideo(detected);

          // place a marker when detected
          const latNum = typeof data.lat === "number" ? data.lat : parseFloat(data.lat);
          const lonNum = typeof data.lon === "number" ? data.lon : parseFloat(data.lon);
          if (detected && Number.isFinite(latNum) && Number.isFinite(lonNum)) {
            setTargetFoundAt((prev) => [
              ...prev,
              {
                cctv_id: "DRONE",
                location_name: "Drone Detection",
                coordinates: { lat: latNum, lng: lonNum },
                timestamp: new Date(),
              },
            ]);
          }

          // Build a minimal timeline if timestamps are provided
          if (Array.isArray(data.timestamps)) {
            const safe = (data.timestamps as any[])
              .filter((s: any) => typeof s === "number" && Number.isFinite(s))
              .map((s: number) => ({ second: s, max_debris_detected: detected ? 1 : 0 }));
            setTimelineData(safe);
          } else {
            setTimelineData([]);
          }

          // Capture audio analysis if provided
          if (Array.isArray(data.audio_analysis)) {
            const aa = (data.audio_analysis as any[])
              .map((e: any) => ({
                timestamp: Number(e?.timestamp),
                speech_ratio: Number(e?.speech_ratio),
                label: typeof e?.label === "string" ? e.label : undefined,
              }))
              .filter((e) => Number.isFinite(e.timestamp) && Number.isFinite(e.speech_ratio));
            setAudioAnalysis(aa);
          } else {
            setAudioAnalysis([]);
          }
          return;
        }

        // Fallback to the original array shape
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const transformed = Array.isArray(arr)
          ? arr
              .filter((item: any) => item && typeof item.second === "number")
              .map((item: any) => ({
                second: Number(item.second),
                max_debris_detected: Number(item.max_debris_detected) || 0,
              }))
          : [];
        setTimelineData(transformed);
      } catch (e) {
        console.error("Error fetching timeline:", e);
        setTimelineData([]);
        setPersonFoundFromVideo(null);
        setAudioAnalysis([]);
        setFetchError((e as Error)?.message || "Failed to fetch");
      } finally {
        setIsLoadingTimeline(false);
      }
    };

    fetchTimeline();
  }, [videoURL, refreshKey]);

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
            <CardContent className="p-5 space-y-4">
              <UploadVideoContainer setVideoURL={setVideoURL} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400" htmlFor="drone-lat">Latitude (optional)</label>
                  <input
                    id="drone-lat"
                    className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
                    placeholder="e.g. 12.34"
                    value={droneLatInput}
                    onChange={(e) => setDroneLatInput(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400" htmlFor="drone-lon">Longitude (optional)</label>
                  <input
                    id="drone-lon"
                    className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
                    placeholder="e.g. 56.78"
                    value={droneLonInput}
                    onChange={(e) => setDroneLonInput(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Video + Map */}
        <div ref={gridRef} className="flex flex-col gap-6">
          <Card className="bg-black border-gray-800/80 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Live Video Preview</h2>
              <div className="flex items-center gap-2">
                {videoURL ? (
                  <Badge variant="outline" className="border-sky-400/40 text-sky-300">Ready</Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-600 text-gray-400">Idle</Badge>
                )}
              </div>
            </div>
            <CardContent className="p-0">
              <VideoContainer videoURL={videoURL} />
              {typeof personFoundFromVideo === "boolean" && (
                <div className="px-5 py-3 border-t border-gray-800/80 bg-gray-900/40">
                  {personFoundFromVideo ? (
                    <div className="text-sm text-emerald-300 flex items-center gap-2">
                      <BellRing className="h-4 w-4" /> Backend indicates a human is detected in this footage. Marker added to map.
                    </div>
                  ) : (
                    <div className="text-sm text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> No human detected in this footage.
                    </div>
                  )}
                </div>
              )}
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
              <div className="flex items-center gap-2">
                {fetchError && (
                  <Badge variant="outline" className="border-rose-400/30 text-rose-300">{fetchError}</Badge>
                )}
                {isLoadingTimeline ? (
                  <Badge variant="outline" className="border-amber-400/30 text-amber-300">Processing</Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-400/30 text-emerald-300">Updated</Badge>
                )}
              </div>
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

          <Card className="bg-gray-900/60 border-gray-800/80 overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Audio Analysis</h2>
              {audioAnalysis.length ? (
                <Badge variant="outline" className="border-sky-400/30 text-sky-300">{audioAnalysis.length} entries</Badge>
              ) : null}
            </div>
            <CardContent className="p-4 max-h-[220px] overflow-y-auto space-y-2">
              {audioAnalysis.length ? (
                audioAnalysis.map((a, idx) => (
                  <div key={idx} className="p-3 rounded-md bg-gray-800/70 border border-gray-700/60 flex items-center justify-between">
                    <div className="text-xs text-gray-300">{formatTime(a.timestamp)}</div>
                    <div className="text-sm font-semibold text-emerald-300">
                      {(a.label || "").toString() || "n/a"}
                      <span className="ml-2 text-xs text-gray-400">({(a.speech_ratio * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No audio analysis available.</div>
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
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              Refresh
            </Button>
            <span className="text-xs text-gray-500">APIs unchanged; reading live from backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}


