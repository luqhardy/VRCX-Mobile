import { Capacitor } from '@capacitor/core';

export const isMobile = Capacitor.isNativePlatform();
// Since Vite replaces process.env with import.meta.env or statically replaces process.env.PLATFORM (we defined MOBILE in define)
// @ts-ignore
export const isMobilePlatform = typeof MOBILE !== 'undefined' ? MOBILE : isMobile;
export const isElectron = !isMobilePlatform && typeof window !== 'undefined' && window.require !== undefined;
export const isWeb = !isMobilePlatform && !isElectron;
