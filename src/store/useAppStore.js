import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Auth
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('ll_token', token);
    else localStorage.removeItem('ll_token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('ll_token');
    set({ user: null, token: null });
  },

  // Dashboard state
  automationEnabled: false,
  selectedMode: 'romantic',
  generationType: 'A',
  currentLetter: null,
  isGenerating: false,

  setAutomation: (enabled) => set({ automationEnabled: enabled }),
  setMode: (mode) => set({ selectedMode: mode }),
  setGenerationType: (type) => set({ generationType: type }),
  setCurrentLetter: (letter) => set({ currentLetter: letter }),
  setGenerating: (v) => set({ isGenerating: v }),

  // Letter history
  letters: [],
  setLetters: (letters) => set({ letters }),
  addLetter: (letter) => set((s) => ({ letters: [letter, ...s.letters] })),
}));

export default useAppStore;
