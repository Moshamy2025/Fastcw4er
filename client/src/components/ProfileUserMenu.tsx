import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User } from "firebase/auth";

interface ProfileUserMenuProps {
  user: User;
  onSignOut: () => void;
}

export function ProfileUserMenu({ user, onSignOut }: ProfileUserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <p className="font-medium text-sm">{user.displayName}</p>
        <p className="text-xs text-muted-foreground truncate w-40">{user.email}</p>
      </div>
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
        <AvatarFallback>
          {user.displayName ? user.displayName.slice(0, 2) : "UN"}
        </AvatarFallback>
      </Avatar>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSignOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>تسجيل الخروج</span>
      </Button>
    </div>
  );
}