import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Centralized API configuration

// Toggle this to true when building the APK for production (EAS build)
// Or use __DEV__ logic natively: const IS_PRODUCTION = !__DEV__;
const IS_PRODUCTION = !__DEV__;

// NOTE: For physical device testing over WiFi, it's better to use Expo Constants 
// to automatically determine your local IP address dynamically rather than hardcoding it
const debuggerHost = Constants.expoConfig?.hostUri;
const localIP = debuggerHost ? debuggerHost.split(':')[0] : '10.198.71.16';

export const LOCAL_API_URL = Platform.OS === 'android' && !debuggerHost 
  ? 'http://10.0.2.2:5000/api'
  : `http://${localIP}:5000/api`;

// IMPORTANT: Replace this with your actual Render or MongoDB Atlas-backed production URL
//export const PROD_API_URL = "https://eva-backend-d1nu.onrender.com/api";
export const PROD_API_URL = "https://eva-backend-1-cyd9.onrender.com/api";

// The final active URL
// ALWAYS use the production backend as requested for stability across Expo Go and APK
export const API_URL = PROD_API_URL;
