import { Loader2, Search } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ 
  message = "Searching through documents...", 
  size = "md" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
        <div className="relative rounded-full bg-primary/10 p-4">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
        <div className="flex items-center justify-center mt-2 space-x-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse-gentle"></div>
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse-gentle" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse-gentle" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export const SearchingSkeleton = () => {
  return (
    <div className="space-y-4 p-4 animate-fade-in">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <Search className="h-3 w-3 text-muted-foreground" />
          <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded-full w-16 animate-pulse"></div>
          <div className="h-6 bg-muted rounded-full w-20 animate-pulse"></div>
          <div className="h-6 bg-muted rounded-full w-14 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};