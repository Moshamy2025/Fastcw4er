import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";

import CommunityPostsPage from "@/pages/community-posts";
import SavedRecipesPage from "@/pages/saved-recipes";
import { ReactNode, useEffect } from "react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { MobileMenuButton } from "@/components/MobileMenuButton";
import { ContactModal } from "@/components/ContactModal";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { handleRedirectResult } from "@/lib/firebase";

// هيكل الصفحة المشترك
function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader />
      <MobileMenuButton />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
            &copy; 2025 Quick Recipe by Egyptco. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center">
            <ContactModal />
          </div>
        </div>
      </footer>
    </div>
  );
}

// هنا نقوم بمعالجة المصادقة وتعامل Redux لأجهزة الهاتف المحمول
function AuthRedirectWrapper({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  // معالجة نتيجة تسجيل الدخول عبر إعادة التوجيه من الأجهزة المحمولة
  useEffect(() => {
    // التحقق من وجود نتيجة تسجيل دخول
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result from mobile login...");
        const user = await handleRedirectResult();
        if (user) {
          console.log("User logged in via redirect, redirecting to home page:", user.displayName);
          // إعادة توجيه لصفحة الرئيسية بعد التسجيل الناجح
          setLocation('/');
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    // تنفيذ التحقق فورًا عند تحميل المكون
    checkRedirectResult();
  }, [setLocation]);

  // إعادة المكونات الفرعية دون تغيير
  return <>{children}</>;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthRedirectWrapper>
          <AppLayout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/profile" component={ProfilePage} />

              <Route path="/community-posts" component={CommunityPostsPage} />
              <Route path="/saved-recipes" component={SavedRecipesPage} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </AuthRedirectWrapper>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
