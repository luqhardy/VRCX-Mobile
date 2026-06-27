import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import initSqlJs from 'sql.js/dist/sql-asm.js';

const isNative = Capacitor.isNativePlatform();

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('vrcx_sqlite_db', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files');
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function loadDatabaseFile() {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('files', 'readonly');
            const store = transaction.objectStore('files');
            const request = store.get('sqlite.db');
            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    } catch (e) {
        console.error('[SQLite] Failed to load database from IndexedDB:', e);
        return null;
    }
}

async function saveDatabaseFile(data) {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('files', 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.put(data, 'sqlite.db');
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    } catch (e) {
        console.error('[SQLite] Failed to save database to IndexedDB:', e);
    }
}

export async function initMobileApis() {
    // Use a Proxy to silently no-op any AppApi method call without listing them all.
    // This covers AppApi.CustomCss(), AppApi.GetVersion(), AppApi.SetUserAgent(), etc.
    window.AppApi = new Proxy({}, {
        get(_, methodName) {
            return async (...args) => {
                console.debug(`[AppApi stub] ${methodName}(`, ...args, ') → noop');
                return null;
            };
        }
    });

    window.WebApi = {
        Execute: async (options) => {
            const { url, method, headers, body } = options;
            try {
                let status, dataString;
                if (isNative) {
                    // On device: use CapacitorHttp for native cookie and CORS handling
                    const { CapacitorHttp } = await import('@capacitor/core');
                    const response = await CapacitorHttp.request({
                        url,
                        method,
                        headers: headers || {},
                        data: body ? JSON.parse(body) : undefined,
                    });
                    dataString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                    status = response.status;
                } else {
                    // Browser dev mode: use regular fetch (CORS will apply)
                    // Redirect through Vite dev server proxy to bypass CORS
                    let proxiedUrl = url;
                    if (url.startsWith('https://api.vrchat.cloud/')) {
                        proxiedUrl = url.replace('https://api.vrchat.cloud/', '/vrchat-api/');
                    } else if (url.startsWith('https://files.vrchat.cloud/')) {
                        proxiedUrl = url.replace('https://files.vrchat.cloud/', '/vrchat-files/');
                    }
                    const response = await fetch(proxiedUrl, {
                        method,
                        headers: { 'Content-Type': 'application/json', ...headers },
                        body: body || undefined,
                        credentials: 'include',
                    });
                    dataString = await response.text();
                    status = response.status;
                }

                return { Item1: status, Item2: dataString };
            } catch (error) {
                console.error('WebApi.Execute Error:', error);
                return { Item1: -1, Item2: error.message };
            }
        },
        ExecuteJson: async () => '{}',
        GetCookies: async () => {
            if (isNative) {
                const { CapacitorCookies } = await import('@capacitor/core');
                const cookies = await CapacitorCookies.getCookies();
                return JSON.stringify(cookies);
            }
            return '{}';
        },
        SetCookies: async () => {},
        ClearCookies: async () => {
            if (isNative) {
                const { CapacitorCookies } = await import('@capacitor/core');
                await CapacitorCookies.clearAllCookies();
            }
        }
    };

    window.VRCXStorage = {
        Get: async (key) => {
            const { value } = await Preferences.get({ key });
            return value || '';
        },
        Set: async (key, value) => {
            await Preferences.set({ key, value: String(value) });
        },
        Save: async () => {}, // No-op, Preferences saves immediately
        Remove: async (key) => {
            await Preferences.remove({ key });
        },
        GetAll: async () => {
            const { keys } = await Preferences.keys();
            const result = {};
            for (let k of keys) {
                const { value } = await Preferences.get({ key: k });
                result[k] = value;
            }
            return JSON.stringify(result);
        },
        GetArray: async (key) => {
            const { value } = await Preferences.get({ key });
            return value ? JSON.parse(value) : [];
        },
        SetArray: async (key, arr) => {
            await Preferences.set({ key, value: JSON.stringify(arr) });
        },
        GetObject: async (key) => {
            const { value } = await Preferences.get({ key });
            return value ? JSON.parse(value) : {};
        },
        SetObject: async (key, obj) => {
            await Preferences.set({ key, value: JSON.stringify(obj) });
        }
    };

    // Initialize SQL.js and database
    let dbInstance = null;
    try {
        const SQL = await initSqlJs();
        const savedDbData = await loadDatabaseFile();
        dbInstance = new SQL.Database(savedDbData || undefined);
        console.log('[SQLite] Database loaded. Size:', savedDbData ? savedDbData.byteLength : 0);
    } catch (err) {
        console.error('[SQLite] Failed to initialize database:', err);
    }

    let saveTimeout = null;
    function queueSave() {
        if (!dbInstance) return;
        if (saveTimeout) return;
        saveTimeout = setTimeout(async () => {
            saveTimeout = null;
            try {
                if (dbInstance) {
                    const binaryData = dbInstance.export();
                    await saveDatabaseFile(binaryData);
                }
            } catch (err) {
                console.error('[SQLite] Error during auto-save:', err);
            }
        }, 50);
    }

    window.SQLite = {
        Execute: async (sql, args) => {
            if (!dbInstance) {
                console.warn('[SQLite] Execute called before database initialized');
                return [];
            }
            try {
                const bindParams = args || {};
                const res = dbInstance.exec(sql, bindParams);
                if (res.length === 0) {
                    return [];
                }
                return res[0].values;
            } catch (err) {
                console.error('[SQLite] Execute Error:', err, 'SQL:', sql, 'Args:', args);
                throw err;
            }
        },
        ExecuteJson: async (sql, args) => {
            const result = await window.SQLite.Execute(sql, args);
            return JSON.stringify(result);
        },
        ExecuteNonQuery: async (sql, args) => {
            if (!dbInstance) {
                console.warn('[SQLite] ExecuteNonQuery called before database initialized');
                return 0;
            }
            try {
                const bindParams = args || {};
                dbInstance.run(sql, bindParams);
                const rowsModified = dbInstance.getRowsModified();
                queueSave();
                return rowsModified;
            } catch (err) {
                console.error('[SQLite] ExecuteNonQuery Error:', err, 'SQL:', sql, 'Args:', args);
                throw err;
            }
        }
    };

    window.LogWatcher = {};
    window.Discord = {
        Init: () => {},
        Update: () => {},
        Shutdown: () => {}
    };
    window.AssetBundleManager = {};
}
