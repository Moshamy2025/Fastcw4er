import { useContext, createContext, ReactNode, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: number;
  username: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  firebaseUid?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is already set in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }

    // Listen for Firebase auth state changes
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          try {
            // Use Firebase user to authenticate with our backend
            const idToken = await firebaseUser.getIdToken();
            
            // In a real app, send the token to the backend and verify it there
            // For this demo, we'll just create a user record with Firebase data
            try {
              // أولاً، نحاول تسجيل مستخدم جديد
              const registerResponse = await apiRequest("POST", "/api/users/register", {
                username: firebaseUser.displayName || firebaseUser.email || `user_${firebaseUser.uid.substring(0, 8)}`,
                password: `firebase_${firebaseUser.uid}`, 
                confirmPassword: `firebase_${firebaseUser.uid}`,
                email: firebaseUser.email,
                firebaseUid: firebaseUser.uid,
                photoURL: firebaseUser.photoURL
              });
              
              let userData;
              
              if (registerResponse.ok) {
                // نجح التسجيل
                userData = await registerResponse.json();
              } else {
                // إذا فشل التسجيل لأن المستخدم موجود بالفعل
                const errorData = await registerResponse.json();
                
                if (errorData.message === "Username already exists") {
                  // نحاول تسجيل الدخول
                  const loginResponse = await apiRequest("POST", "/api/login", {
                    username: firebaseUser.displayName || firebaseUser.email || `user_${firebaseUser.uid.substring(0, 8)}`,
                    password: `firebase_${firebaseUser.uid}`
                  });
                  
                  if (loginResponse.ok) {
                    userData = await loginResponse.json();
                  } else {
                    throw new Error("Failed to login with existing Firebase account");
                  }
                } else {
                  throw new Error("Failed to register with Firebase account: " + errorData.message);
                }
              }
              
              // حفظ بيانات المستخدم
              setUser({
                ...userData,
                displayName: firebaseUser.displayName || undefined,
                photoURL: firebaseUser.photoURL || undefined,
                email: firebaseUser.email || undefined
              });
              
              localStorage.setItem("user", JSON.stringify({
                ...userData,
                displayName: firebaseUser.displayName || undefined,
                photoURL: firebaseUser.photoURL || undefined,
                email: firebaseUser.email || undefined
              }));
            } catch (err) {
              console.error("Authentication error:", err);
              throw err;
            }
          } catch (err) {
            console.error("Error authenticating with backend:", err);
            setError(err instanceof Error ? err : new Error(String(err)));
            toast({
              title: "خطأ في تسجيل الدخول",
              description: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
              variant: "destructive",
            });
          }
        }
        
        setIsLoading(false);
      },
      (err) => {
        console.error("Firebase auth error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}