import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
  UserCredential
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import env, { logEnvStatus } from "./env-loader";

// تسجيل حالة المتغيرات البيئية
logEnvStatus();

// Firebase configuration
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY.trim(),
  authDomain: `${env.VITE_FIREBASE_PROJECT_ID.trim()}.firebaseapp.com`,
  projectId: env.VITE_FIREBASE_PROJECT_ID.trim(),
  storageBucket: `${env.VITE_FIREBASE_PROJECT_ID.trim()}.appspot.com`,
  appId: env.VITE_FIREBASE_APP_ID.trim(),
};

// تسجيل التكوين في وحدة التحكم للتصحيح (بدون الكشف عن المفاتيح الحساسة)
console.log("Firebase config (without sensitive keys):", { 
  projectId: env.VITE_FIREBASE_PROJECT_ID.trim(),
  authDomain: `${env.VITE_FIREBASE_PROJECT_ID.trim()}.firebaseapp.com`, 
  hasApiKey: !!env.VITE_FIREBASE_API_KEY,
  hasAppId: !!env.VITE_FIREBASE_APP_ID
});

// عرض رسالة توضيحية حول مشكلة تكوين Firebase
console.warn(`
يجب إضافة النطاق: "${window.location.origin}" 
إلى قائمة النطاقات المصرح بها في لوحة تحكم Firebase:
- Firebase console -> Authentication -> Settings -> Authorized domains tab
`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with Google - using both methods for better compatibility
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // يضيف نطاق للوصول إلى قائمة الاسماء والصور الشخصية
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    // Force account selection every time to prevent automatic login 
    // and user confusion if multiple Google accounts exist
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // نجرب طريقة النافذة المنبثقة أولاً على الأجهزة المكتبية
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log("Using redirect method for mobile device");
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.log("Using popup method for desktop device");
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        console.log("Popup failed, falling back to redirect:", popupError);
        await signInWithRedirect(auth, googleProvider);
      }
    }
  } catch (error) {
    console.error("Error initiating sign-in with Google:", error);
    throw error;
  }
};

// Handle redirect result
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // تم تسجيل الدخول بنجاح
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in");
  }
  
  try {
    await updateProfile(user, {
      displayName,
      photoURL: photoURL || user.photoURL
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is logged in");
  }
  
  try {
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    await updateProfile(user, {
      photoURL: downloadURL
    });
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };