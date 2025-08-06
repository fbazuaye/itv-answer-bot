import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  showButtons?: boolean;
}

export const SearchInput = ({ 
  onSearch, 
  isLoading = false, 
  placeholder = "Ask anything or search through documents...",
  showButtons = true
}: SearchInputProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleFeelingCurious = () => {
    const curiousQueries = [
      "What are the latest technology trends?",
      "How does artificial intelligence work?",
      "What is sustainable development?",
      "Tell me about renewable energy sources",
      "How does blockchain technology work?"
    ];
    const randomQuery = curiousQueries[Math.floor(Math.random() * curiousQueries.length)];
    setQuery(randomQuery);
    onSearch(randomQuery);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-200 shadow-lg"
            disabled={isLoading}
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
          )}
        </div>
      </form>

      {showButtons && (
        <div className="flex gap-3 mt-6 justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="rounded-full px-6 py-2"
          >
            Search
          </Button>
          <Button
            variant="outline"
            onClick={handleFeelingCurious}
            disabled={isLoading}
            className="rounded-full px-6 py-2"
          >
            I'm Feeling Curious
          </Button>
        </div>
      )}
    </div>
  );
};