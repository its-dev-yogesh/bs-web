import type { StateCreator } from "zustand";

export type ComposerSlice = {
  draftContent: string;
  draftMediaUrls: string[];
  isComposerOpen: boolean;
  setDraftContent: (v: string) => void;
  addDraftMedia: (url: string) => void;
  removeDraftMedia: (url: string) => void;
  openComposer: () => void;
  closeComposer: () => void;
  resetComposer: () => void;
};

const empty = { draftContent: "", draftMediaUrls: [], isComposerOpen: false };

export const createComposerSlice: StateCreator<
  ComposerSlice,
  [],
  [],
  ComposerSlice
> = (set) => ({
  ...empty,
  setDraftContent: (draftContent) => set({ draftContent }),
  addDraftMedia: (url) =>
    set((s) => ({ draftMediaUrls: [...s.draftMediaUrls, url] })),
  removeDraftMedia: (url) =>
    set((s) => ({
      draftMediaUrls: s.draftMediaUrls.filter((u) => u !== url),
    })),
  openComposer: () => set({ isComposerOpen: true }),
  closeComposer: () => set({ isComposerOpen: false }),
  resetComposer: () => set(empty),
});
