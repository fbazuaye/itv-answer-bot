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
      <ConversationHistory
        conversations={conversations}
        activeConversationId={activeConversationId || undefined}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <div className="flex-1 flex flex-col">
        {/* Header with auth controls */}
        <div className="border-b border-border p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/32ce3de8-9ebe-4ea5-a38c-b9df9e3b3710.png" 
              alt="ITV Benin Logo" 
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setActiveConversationId(null);
                navigate('/');
              }}
              className="text-sm hover:bg-accent"
            >
              🏠 Home
            </Button>
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="text-sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
        {!activeConversation ? (
          // Homepage view
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-12">
              <img 
                src="/lovable-uploads/32ce3de8-9ebe-4ea5-a38c-b9df9e3b3710.png" 
                alt="ITV Benin Logo" 
                className="h-20 mx-auto mb-8"
              />
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                ITV Ai News Search Engine
              </h1>
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl">
                Powered by advanced AI to search through our News Bulletin and provide intelligent answers
              </p>
              {user && (
                <p className="text-sm text-muted-foreground mb-8">
                  Welcome back, {user.email}! Your search history is automatically saved.
                </p>
              )}
              {!user && (
                <p className="text-sm text-muted-foreground mb-8">
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/auth')}
                    className="p-0 h-auto text-primary"
                  >
                    Sign in
                  </Button>
                  {' '}to save your search history and get personalized results.
                </p>
              )}
            </div>

            <SearchInput onSearch={handleSearch} isLoading={isLoading} />

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Powered By LiveGig Ltd
              </p>
            </div>
          </div>
        ) : (
          // Chat view
          <div className="flex-1 flex flex-col">
            <div className="border-b border-border p-4">
              <h2 className="font-semibold text-lg truncate">
                {activeConversation.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeConversation.messageCount} message{activeConversation.messageCount !== 1 ? 's' : ''}
              </p>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                {activeConversation.messages
                  .filter(message => message.type === 'ai')
                  .map((message) => (
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

            <div className="border-t border-border p-4">
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