// @ts-nocheck
import InteropApi from '../ipc-electron/interopApi.js';
import configRepository from '../services/config.js';
import vrcxJsonStorage from '../services/jsonStorage.js';
import { isMobilePlatform } from '../shared/utils/appPlatform.js';
import { initMobileApis } from './mobileApi.js';

export async function initInteropApi(isVrOverlay = false) {
    // Mobile (Capacitor native) OR plain browser: use JS stubs instead of C# bridge
    if (isMobilePlatform || typeof CefSharp === 'undefined' && !window.interopApi) {
        await initMobileApis();
        await configRepository.init();
        new vrcxJsonStorage(VRCXStorage);
        if (window.AppApi && window.AppApi.SetUserAgent) {
            window.AppApi.SetUserAgent();
        }
        return;
    }

    if (isVrOverlay) {
        if (WINDOWS && typeof CefSharp !== 'undefined') {
            await CefSharp.BindObjectAsync('AppApiVr');
        } else {
            // @ts-ignore
            window.AppApiVr = InteropApi.AppApiVrElectron;
        }
    } else {
        if (WINDOWS && typeof CefSharp !== 'undefined') {
            // Real CEF C# desktop app
            await CefSharp.BindObjectAsync(
                'AppApi',
                'WebApi',
                'VRCXStorage',
                'SQLite',
                'LogWatcher',
                'Discord',
                'AssetBundleManager'
            );
        } else {
            // Electron: the preload script exposes window.interopApi
            window.AppApi = InteropApi.AppApiElectron;
            window.WebApi = InteropApi.WebApi;
            window.VRCXStorage = InteropApi.VRCXStorage;
            window.SQLite = InteropApi.SQLite;
            window.LogWatcher = InteropApi.LogWatcher;
            window.Discord = InteropApi.Discord;
            window.AssetBundleManager = InteropApi.AssetBundleManager;
            window.AppApiVrElectron = InteropApi.AppApiVrElectron;
        }

        await configRepository.init();
        new vrcxJsonStorage(VRCXStorage);

        if (window.AppApi && window.AppApi.SetUserAgent) {
            AppApi.SetUserAgent();
        }
    }
}
