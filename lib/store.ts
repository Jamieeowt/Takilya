import { create } from 'zustand';

export type UserRole = 'user' | 'critic' | 'verified_official' | 'admin';

interface AppState {
  // Active film or clip playing in the vertical feed
  activeVideoId: string | null;
  isVideoMuted: boolean;
  userRole: UserRole;

  // Actions
  setActiveVideoId: (id: string | null) => void;
  toggleVideoMute: () => void;
  setUserRole: (role: UserRole) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeVideoId: null,
  isVideoMuted: false,
  userRole: 'user',

  setActiveVideoId: (id) => set({ activeVideoId: id }),
  toggleVideoMute: () => set((state) => ({ isVideoMuted: !state.isVideoMuted })),
  setUserRole: (role) => set({ userRole: role }),
}));

