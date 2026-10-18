"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStoryMode, setStoryMode, STORY_FAIL_EVENT, type StoryMode } from "@/lib/story";
import StoryStage from "@/components/story/StoryStage";
import { useStoryScroll } from "@/components/story/useStoryScroll";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

let webglCache: boolean | null = null;
function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

function computeMode(failed: boolean): StoryMode {
  if (process.env.NODE_ENV !== "production") {
    const forced = new URLSearchParams(window.location.search).get("story");
    if (forced === "on" || forced === "off") return forced;
  }
  const on =
    window.matchMedia(DESKTOP_QUERY).matches &&
    !window.matchMedia(REDUCED_QUERY).matches &&
    hasWebGL() &&
    !failed;
  return on ? "on" : "off";
}

export default function StoryProvider({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onFail = () => setFailed(true);
    window.addEventListener(STORY_FAIL_EVENT, onFail);
    return () => window.removeEventListener(STORY_FAIL_EVENT, onFail);
  }, []);

  useEffect(() => {
    const mqDesktop = window.matchMedia(DESKTOP_QUERY);
    const mqReduced = window.matchMedia(REDUCED_QUERY);
    let raf = 0;

    const apply = () => {
      const next = computeMode(failed);
      document.documentElement.dataset.story = next;
      if (next !== getStoryMode()) {
        setStoryMode(next);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    };

    apply();
    mqDesktop.addEventListener("change", apply);
    mqReduced.addEventListener("change", apply);

    return () => {
      cancelAnimationFrame(raf);
      mqDesktop.removeEventListener("change", apply);
      mqReduced.removeEventListener("change", apply);
    };
  }, [failed]);

  useStoryScroll(rootRef);

  return (
    <div ref={rootRef} data-story-root className="relative">
      <StoryStage />
      {children}
    </div>
  );
}
