'use client';

import { RecommendedTopic } from '@/types/instagram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import EmptyState from '@/components/EmptyState';
import { Hash, Sparkles, Tag, ChevronDown, Info, RefreshCw, Search, Users, Heart, X } from 'lucide-react';
import { useState } from 'react';

interface RecommendedTopicsDisplayProps {
  recommendedTopics: RecommendedTopic[];
  /** Whether the data is from a summary (after page refresh) */
  isSummary?: boolean;
}

export default function RecommendedTopicsDisplay({ recommendedTopics, isSummary = false }: RecommendedTopicsDisplayProps) {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  if (!recommendedTopics || recommendedTopics.length === 0) {
    return (
      <EmptyState
        title="No Recommended Topics"
        icon={Sparkles}
        isSummary={isSummary}
      />
    );
  }

  // Sort topics by name alphabetically
  const sortedTopics = [...recommendedTopics].sort((a, b) =>
    a.string_map_data.Name.value.localeCompare(b.string_map_data.Name.value)
  );

  return (
    <>
      {/* How to Reset Recommended Topics */}
      <Card className="my-4">
        <Collapsible open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-4 sm:p-6 h-auto hover:bg-accent !whitespace-normal"
            >
              <div className="flex items-center justify-evenly md:justify-start md:gap-3 w-full">
                <div className="hidden w-10 h-10 rounded-full bg-primary/10 md:flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left" style={{ width: 'calc(100% - 5rem)', maxWidth: 'calc(100% - 5rem)', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  <h3 className="font-semibold text-base sm:text-lg leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>How to Reset Recommended Topics</h3>
                  <p className="text-sm text-muted-foreground mt-1" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    Follow these steps to reset or refine your Instagram recommendations
                  </p>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 flex-shrink-0 ${isInstructionsOpen ? 'rotate-180' : ''}`} />
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-4">
              {/* Step 1 */}
              <div className="group p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-1000 animate-slide-in-fade" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-semibold text-sm sm:text-base">Clear Search History</h4>
                    </div>
                    <ol className="space-y-1.5 text-sm text-muted-foreground ml-4 sm:ml-6 list-decimal break-words">
                      <li>Open Instagram and go to your profile</li>
                      <li>Tap the three horizontal lines (menu) → Settings</li>
                      <li>Tap on &quot;Security&quot; → &quot;Data and History&quot;</li>
                      <li>Select &quot;Search History&quot; → Tap &quot;Clear All&quot;</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-1000 animate-slide-in-fade" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    2
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-semibold text-sm sm:text-base">Manage Followed Accounts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4 sm:ml-6 break-words">
                      Review and unfollow accounts that no longer interest you. This helps Instagram tailor recommendations based on your current interests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-1000 animate-slide-in-fade" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    3
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-semibold text-sm sm:text-base">Engage with Desired Content</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4 sm:ml-6 break-words">
                      Like, comment, and share posts, stories, and reels that align with your interests to signal your preferences to Instagram&apos;s algorithm.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="group p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-1000 animate-slide-in-fade" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    4
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h4 className="font-semibold text-sm sm:text-base">Use &quot;Not Interested&quot; Feature</h4>
                    </div>
                    <ol className="space-y-1.5 text-sm text-muted-foreground ml-4 sm:ml-6 list-decimal break-words">
                      <li>Go to the Explore page (magnifying glass icon)</li>
                      <li>Tap the three dots on posts you don&apos;t like</li>
                      <li>Select &quot;Not Interested&quot; to update your preferences</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Additional Note */}
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-slide-in-fade" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-primary font-medium">Quick Tip</p>
                    <p className="text-xs text-primary/80 mt-1 break-words">
                      Instagram&apos;s algorithm updates gradually. Changes may take a few days to fully reflect in your recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Show Recommended Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="hidden md:block h-5 w-5 text-primary" />
            Recommended Topics
            <Badge variant="secondary" className="ml-2">
              {recommendedTopics.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground break-words">
            Topics that Instagram has recommended to you based on your activity and interests.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedTopics.map((topic, index) => (
              <div
                key={index}
                className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight break-words text-foreground">
                      {topic.string_map_data.Name.value}
                    </h3>
                  </div>
                </div>

                {/* Subtle hover effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span className="break-words">{recommendedTopics.length} topics</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="break-words">Personalized recommendations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </>
  );
}
