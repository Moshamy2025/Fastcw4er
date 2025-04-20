import { Link } from "wouter";
import { UserMenu } from "@/components/UserMenu";

export function HeaderWithAuth() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/">
          <span className="text-2xl font-bold text-orange-500 cursor-pointer">Fast Recipe</span>
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}