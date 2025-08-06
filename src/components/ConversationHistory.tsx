import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export const ConversationHistory = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation
}: ConversationHistoryProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupedConversations = conversations.reduce((groups, conversation) => {
    const dateKey = formatDate(conversation.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-12" : "w-80"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="font-semibold text-sm">Conversation History</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="flex-1 p-2">
          {Object.keys(groupedConversations).length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No conversations yet
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedConversations).map(([dateKey, convos]) => (
                <div key={dateKey}>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    {dateKey}
                  </h3>
                  <div className="space-y-1">
                    {convos.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "group relative rounded-lg p-3 cursor-pointer transition-colors hover:bg-accent",
                          activeConversationId === conversation.id && "bg-accent border border-primary/20"
                        )}
                        onClick={() => onSelectConversation(conversation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate mb-1">
                              {conversation.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {onDeleteConversation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conversation.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {isCollapsed && conversations.length > 0 && (
        <div className="p-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};