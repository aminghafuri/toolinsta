'use client';

import { RecommendedTopic } from '@/types/instagram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, Sparkles, Tag } from 'lucide-react';

interface RecommendedTopicsDisplayProps {
  recommendedTopics: RecommendedTopic[];
}

export default function RecommendedTopicsDisplay({ recommendedTopics }: RecommendedTopicsDisplayProps) {
  if (!recommendedTopics || recommendedTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recommended topics found.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort topics by name alphabetically
  const sortedTopics = [...recommendedTopics].sort((a, b) => 
    a.string_map_data.Name.value.localeCompare(b.string_map_data.Name.value)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended Topics
          <Badge variant="secondary" className="ml-2">
            {recommendedTopics.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
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
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span>{recommendedTopics.length} topics</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Personalized recommendations</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
