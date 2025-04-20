import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface HomeLayoutProps {
  children: ReactNode;
  showUserMenu?: boolean;
}

export default function HomeLayout({ children, showUserMenu = false }: HomeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/">
            <span className="text-2xl font-bold text-orange-500 cursor-pointer">Fast Recipe</span>
          </Link>
          {/* سيتم إضافة UserMenu في صفحات أخرى */}
          <div className="w-8 h-8"></div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
            &copy; 2025 Quick Recipe by Egyptco. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}