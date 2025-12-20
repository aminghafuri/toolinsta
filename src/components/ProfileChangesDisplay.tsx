'use client';

import { ProfileChange } from '@/types/instagram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/EmptyState';
import { User, Hash, Phone, FileText, History } from 'lucide-react';

interface ProfileChangesDisplayProps {
  profileChanges: ProfileChange[];
  /** Whether the data is from a summary (after page refresh) */
  isSummary?: boolean;
}

const getChangeTypeIcon = (changeType: string) => {
  switch (changeType.toLowerCase()) {
    case 'profile name':
      return <User className="h-4 w-4" />;
    case 'username':
      return <Hash className="h-4 w-4" />;
    case 'phone number':
      return <Phone className="h-4 w-4" />;
    case 'profile bio text':
      return <FileText className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getChangeTypeColor = (changeType: string) => {
  switch (changeType.toLowerCase()) {
    case 'profile name':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'username':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'phone number':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'profile bio text':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const formatTimestamp = (timestamp: number): string => {
  if (timestamp === 0) return 'Unknown date';

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const decodeEmoji = (encodedString?: string) => {
  if (!encodedString || typeof encodedString !== 'string') {
    return '';
  }
  try {
    // First, convert Unicode escape sequences to actual characters
    const unicodeDecoded = encodedString.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      const charCode = parseInt(code, 16);
      return String.fromCharCode(charCode);
    });

    // Then use the escape() + decodeURIComponent() trick
    return decodeURIComponent(escape(unicodeDecoded));
  } catch (error) {
    console.error("Failed to decode emoji string:", error);
    // Return original string if decoding fails
    return encodedString;
  }
};

export default function ProfileChangesDisplay({ profileChanges, isSummary = false }: ProfileChangesDisplayProps) {
  if (!profileChanges || profileChanges.length === 0) {
    return (
      <EmptyState
        title="No Profile Changes"
        icon={History}
        isSummary={isSummary}
      />
    );
  }

  // Count changes by type
  const changeTypeCounts = profileChanges.reduce((acc, change) => {
    const changeType = change.string_map_data.Changed.value;
    acc[changeType] = (acc[changeType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group changes by type
  const groupedChanges = profileChanges.reduce((acc, change) => {
    const changeType = change.string_map_data.Changed.value;
    if (!acc[changeType]) {
      acc[changeType] = [];
    }
    acc[changeType].push(change);
    return acc;
  }, {} as Record<string, ProfileChange[]>);

  // Sort changes within each group by timestamp (oldest first)
  Object.keys(groupedChanges).forEach(changeType => {
    groupedChanges[changeType].sort((a, b) => {
      const timestampA = a.string_map_data['Change Date'].timestamp;
      const timestampB = b.string_map_data['Change Date'].timestamp;
      return timestampA - timestampB;
    });
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Changes Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(changeTypeCounts).map(([changeType, count]) => (
              <div key={changeType} className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-muted-foreground">{changeType}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Total changes: <span className="font-semibold">{profileChanges.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Changes - Grouped by Type */}
      {Object.entries(groupedChanges).map(([changeType, changes]) => (
        <Card key={changeType}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getChangeTypeIcon(changeType)}
              {changeType} Changes ({changes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {changes.map((change, index) => {
                const previousValue = change.string_map_data['Previous Value'].value;
                const newValue = change.string_map_data['New Value'].value;
                const changeDate = change.string_map_data['Change Date'].timestamp;

                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getChangeTypeColor(changeType)}>
                          {changeType}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimestamp(changeDate)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {previousValue && (
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            From:
                          </span>
                          <div className="text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded text-red-700 dark:text-red-300 whitespace-pre-wrap">
                            {decodeEmoji(previousValue)}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          To:
                        </span>
                        <div className="text-sm bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded text-green-700 dark:text-green-300 whitespace-pre-wrap">
                          {decodeEmoji(newValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
