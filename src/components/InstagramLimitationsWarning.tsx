"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, X, Clock } from "lucide-react"

interface InstagramLimitationsWarningProps {
  followersData?: Array<{ timestamp?: number }>;
  followingData?: Array<{ timestamp?: number }>;
}

export function InstagramLimitationsWarning({ 
  followersData = [], 
  followingData = [] 
}: InstagramLimitationsWarningProps) {
  const [isClosed, setIsClosed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('instagram-warning-closed') === 'true';
    }
    return false;
  });

  const handleClose = () => {
    setIsClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('instagram-warning-closed', 'true');
    }
  };

  if (isClosed) return null;

  // Calculate date-based analysis
  const followersTimestamps = followersData
    .map(f => f.timestamp)
    .filter(t => t && t > 0);
  
  const followingTimestamps = followingData
    .map(f => f.timestamp)
    .filter(t => t && t > 0);

  const lowestFollowersDate = followersTimestamps.length > 0 ? Math.min(...followersTimestamps.filter(t => t !== undefined) as number[]) : 0;
  const lowestFollowingDate = followingTimestamps.length > 0 ? Math.min(...followingTimestamps.filter(t => t !== undefined) as number[]) : 0;

  // Calculate date difference in days
  const dateDifferenceDays = lowestFollowersDate > 0 && lowestFollowingDate > 0 
    ? Math.abs(lowestFollowersDate - lowestFollowingDate) / (24 * 60 * 60)
    : 0;

  // Check for significant date gap (more than 30 days difference)
  const hasSignificantDateGap = dateDifferenceDays > 30;

  // Show warning only for date range issues
  const shouldShowWarning = hasSignificantDateGap;

  if (!shouldShowWarning) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="mb-6 relative">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-lg">
                  Instagram Export Limitation Detected
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Data quality issues found in your export
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-200 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-800/30 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {hasSignificantDateGap && (
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Date Range Issue Detected</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                        Followers Start Date
                      </div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                        {formatDate(lowestFollowersDate)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        Following Start Date
                      </div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">
                        {formatDate(lowestFollowingDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-3">
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                      Date Gap
                    </div>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {dateDifferenceDays.toFixed(0)} days
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This significant gap suggests Instagram missed early followers data in your export.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Solution Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Smart Solution Applied</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This tool uses intelligent date filtering to improve unfollowers accuracy despite Instagram&apos;s limitations. 
                  Only following data from the earliest followers date onwards is considered for calculations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstagramLimitationsInfo() {
  const [isClosed, setIsClosed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('instagram-info-closed') === 'true';
    }
    return false;
  });

  const handleClose = () => {
    setIsClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('instagram-info-closed', 'true');
    }
  };

  if (isClosed) return null;

  return (
    <div className="mb-6 relative">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                  About Instagram Data Exports
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Understanding Instagram&apos;s export limitations
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-200 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-800/30 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Followers Data Issues */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Followers Data Issues</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Instagram often exports incomplete followers data</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Certain date ranges are frequently missing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This affects unfollowers calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Following data is usually complete and accurate</span>
                </li>
              </ul>
            </div>

            {/* Smart Calculation */}
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Smart Unfollowers Calculation</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This tool uses date-based filtering to improve accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Only considers following data from the earliest followers date onwards</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Reduces false positives in unfollowers detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This is Instagram&apos;s limitation, not a problem with this tool</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
