import { useState } from "react";
import { Bot, User, ExternalLink, Copy, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Source {
  title: string;
  url?: string;
  snippet?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface ChatBubbleProps {
  message: ChatMessage;
  showSources?: boolean;
  onToggleSources?: () => void;
}

export const ChatBubble = ({ message, showSources = false, onToggleSources }: ChatBubbleProps) => {
  const { toast } = useToast();
  const [copiedContent, setCopiedContent] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedContent(true);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied successfully.",
      });
      setTimeout(() => setCopiedContent(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const isUser = message.type === 'user';

  return (
    <div className={`flex gap-3 mb-6 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`rounded-2xl p-4 ${
            isUser
              ? 'bg-chat-user text-white ml-auto'
              : 'bg-chat-ai border border-border'
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <p className="mb-0 whitespace-pre-wrap">{message.content}</p>
          </div>

          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Sources ({message.sources.length})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSources}
                    className="h-6 px-2"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {showSources ? 'Summary' : 'Raw'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 px-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copiedContent ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {showSources ? (
                <div className="space-y-2">
                  {message.sources.map((source, index) => (
                    <div key={index} className="p-2 bg-accent rounded-lg text-sm">
                      <div className="font-medium mb-1">{source.title}</div>
                      {source.snippet && (
                        <p className="text-muted-foreground text-xs">{source.snippet}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {message.sources.map((source, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {source.title}
                      {source.url && (
                        <ExternalLink className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center order-2">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};