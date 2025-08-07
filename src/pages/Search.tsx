import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "@/components/SearchInput";
import { ChatBubble } from "@/components/ChatBubble";
import { ConversationHistory } from "@/components/ConversationHistory";
import { UserMenu } from "@/components/UserMenu";
import { LoadingSpinner, SearchingSkeleton } from "@/components/LoadingSpinner";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  sources?: Array<{
    title: string;
    url?: string;
    snippet?: string;
  }>;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  messages: ChatMessage[];
}

export const Search = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const { search, isLoading } = useSearch();
  const { user, saveSearchHistory, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const createNewConversation = (query: string): Conversation => {
    const id = `conv_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    return {
      id,
      title: query.length > 50 ? query.substring(0, 50) + '...' : query,
      timestamp: new Date(),
      messageCount: 1,
      messages: [userMessage]
    };
  };

  const handleSearch = async (query: string) => {
    let conversation: Conversation;
    
    if (activeConversationId && activeConversation) {
      // Add to existing conversation
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content: query,
        timestamp: new Date()
      };

      conversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, userMessage],
        messageCount: activeConversation.messageCount + 1
      };
    } else {
      // Create new conversation
      conversation = createNewConversation(query);
      setActiveConversationId(conversation.id);
    }

    // Update conversations with user message
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== conversation.id);
      return [conversation, ...filtered];
    });

    // Get AI response
    const result = await search(query);
    
    if (result?.text) {
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'ai',
        content: result.text,
        sources: result.sources,
        timestamp: new Date()
      };

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, aiMessage],
        messageCount: conversation.messageCount + 1
      };

      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conversation.id);
        return [updatedConversation, ...filtered];
      });

      // Save to database if user is authenticated
      if (user && result.text) {
        await saveSearchHistory(query, result.text, result.sources);
      }
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <ConversationHistory
          conversations={conversations}
          activeConversationId={activeConversationId || undefined}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with auth controls */}
        <div className="border-b border-border p-2 sm:p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src="/lovable-uploads/32ce3de8-9ebe-4ea5-a38c-b9df9e3b3710.png" 
              alt="ITV Benin Logo" 
              className="h-6 sm:h-8 flex-shrink-0"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setActiveConversationId(null);
                navigate('/');
              }}
              className="text-xs sm:text-sm hover:bg-accent px-2 sm:px-4"
              size="sm"
            >
              <span className="hidden sm:inline">🏠 Home</span>
              <span className="sm:hidden">🏠</span>
            </Button>
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="text-xs sm:text-sm px-2 sm:px-4"
                size="sm"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>
        {!activeConversation ? (
          // Homepage view
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8 sm:mb-12 max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
                ITV Ai News Search Engine
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto px-4">
                Powered by advanced AI to search through our News Bulletin and provide intelligent answers
              </p>
              {user && (
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
                  Welcome back, {user.email}! Your search history is automatically saved.
                </p>
              )}
              {!user && (
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/auth')}
                    className="p-0 h-auto text-primary text-sm sm:text-base"
                  >
                    Sign in
                  </Button>
                  {' '}to save your search history and get personalized results.
                </p>
              )}
            </div>

            <div className="w-full max-w-4xl px-4">
              <SearchInput onSearch={handleSearch} isLoading={isLoading} />
            </div>

            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Powered By LiveGig Ltd
              </p>
            </div>
          </div>
        ) : (
          // Chat view
          <div className="flex-1 flex flex-col">
            <div className="border-b border-border p-3 sm:p-4">
              <h2 className="font-semibold text-base sm:text-lg truncate">
                {activeConversation.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeConversation.messageCount} message{activeConversation.messageCount !== 1 ? 's' : ''}
              </p>
            </div>

            <ScrollArea className="flex-1 p-3 sm:p-4 lg:p-6">
              <div className="max-w-4xl mx-auto">
                {activeConversation.messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    showSources={showSources}
                    onToggleSources={() => setShowSources(!showSources)}
                  />
                ))}
                
                {isLoading && <SearchingSkeleton />}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-3 sm:p-4">
              <div className="max-w-4xl mx-auto">
                <SearchInput
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  placeholder="Ask a follow-up question..."
                  showButtons={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};