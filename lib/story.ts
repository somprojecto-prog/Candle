import { SECTION_IDS } from "@/lib/constants";

export const STORY_STEPS = ["hero", "reveal", "intention", "notes", "offer"] as const;
export type StoryStep = (typeof STORY_STEPS)[number];

export const STORY_SECTION_IDS = [
  SECTION_IDS.top,
  SECTION_IDS.product,
  SECTION_IDS.about,
  SECTION_IDS.notes,
  SECTION_IDS.offer,
] as const;

export const STORY_SECTION_VH: Record<StoryStep, number> = {
  hero: 150,
  reveal: 165,
  intention: 165,
  notes: 175,
  offer: 150,
};

export const STORY_FOCUS = [
  [0.7, 0.52],
  [0.7, 0.52],
  [0.3, 0.54],
  [0.5, 0.5],
  [0.68, 0.52],
] as const satisfies readonly (readonly [number, number])[];

export interface StoryState {
  phase: number;
  active: boolean;
}

export const storyState: StoryState = { phase: 0, active: false };
export function resetStoryState(): void {
  storyState.phase = 0;
  storyState.active = false;
}

export type StoryMode = "on" | "off";
let mode: StoryMode = "off";
const listeners = new Set<() => void>();
export const getStoryMode = (): StoryMode => mode;
export const getServerStoryMode = (): StoryMode => "off";
export function setStoryMode(next: StoryMode): void {
  if (next === mode) return;
  mode = next;
  listeners.forEach((l) => l());
}
export function subscribeStoryMode(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const STORY_FAIL_EVENT = "story:fail";
export function failStory(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(STORY_FAIL_EVENT));
}
