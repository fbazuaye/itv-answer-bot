import { User, LogOut, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserMenuProps {
  onShowHistory?: () => void;
}

export const UserMenu = ({ onShowHistory }: UserMenuProps) => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
              {getInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm truncate max-w-[200px]">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {onShowHistory && (
          <DropdownMenuItem onClick={onShowHistory} className="text-sm">
            <History className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span>Search History</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleSignOut} className="text-sm">
          <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};