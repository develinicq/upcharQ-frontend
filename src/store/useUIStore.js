import { create } from 'zustand';

const useUIStore = create((set) => ({
    breadcrumbEntityName: '',
    setBreadcrumbEntityName: (name) => set({ breadcrumbEntityName: name }),
    clearBreadcrumbEntityName: () => set({ breadcrumbEntityName: '' }),
    isLoggingOut: false,
    setIsLoggingOut: (val) => set({ isLoggingOut: val }),
}));

export default useUIStore;
