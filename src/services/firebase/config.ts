/**
 * Configuration for Firebase projects
 */

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
}

/**
 * These configs are only used as fallbacks if environment variables are not set.
 * They're identical to the Vue configs to maintain compatibility.
 */
export const firebaseProjectConfigs: Record<string, FirebaseConfig> = {
  "vfsadmin-dev": {
    apiKey: "AIzaSyAAcO2NPCeYd5Gp4IpzMoI8zjavccf7lsk",
    authDomain: "vfsadmin-dev.firebaseapp.com",
    projectId: "vfsadmin-dev",
    storageBucket: "vfsadmin-dev.appspot.com",
    messagingSenderId: "711628810105",
    appId: "1:711628810105:web:cc7dae01d97cbc9272b1a8",
    measurementId: "G-X4Z5Y0KFWM",
  },
  vfsadmin: {
    apiKey: "AIzaSyCVGq822-4eqNWdA2JiLJb6ute4i-2Q78k",
    authDomain: "vfsadmin.firebaseapp.com",
    databaseURL: "https://vfsadmin.firebaseio.com",
    projectId: "vfsadmin",
    storageBucket: "vfsadmin.appspot.com",
    messagingSenderId: "216985456646",
    appId: "1:216985456646:web:0f6cda01fd0bb02134b387",
    measurementId: "G-X9QMPDKSGP",
  },
};

/**
 * Determines which Firebase project to use:
 * - Prefers environment variables (set in .env files)
 * - Falls back to hardcoded configs if not available
 * - Defaults to 'vfsadmin' for production
 */
export function getFirebaseConfig(): FirebaseConfig {
  // Check if we have environment variables
  const hasEnvConfig = import.meta.env.VITE_FIREBASE_API_KEY;

  if (hasEnvConfig) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }

  // If no environment variables, fall back to hardcoded configs
  const projectName = import.meta.env.VITE_FIREBASE_PROJECT || "vfsadmin";
  const config = firebaseProjectConfigs[projectName];

  if (!config) {
    console.error(
      `No Firebase DB config for project '${projectName}'. ` +
        `Please check your environment variables or define a config in config.ts`,
    );
    // Return the production config as a last resort
    return firebaseProjectConfigs.vfsadmin;
  }

  return config;
}
