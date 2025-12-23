'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  UserPlus,
  UserX,
  Clock,
  UserMinus,
  X,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Heart
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { InstagramList } from '@/types/instagram'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface InstagramListsProps {
  followers: InstagramList[]
  following: InstagramList[]
  blockedProfiles: InstagramList[]
  pendingFollowRequests: InstagramList[]
  recentFollowRequests: InstagramList[]
  recentlyUnfollowed: InstagramList[]
  removedSuggestions: InstagramList[]
  unfollowers: InstagramList[]
  notFollowedBack: InstagramList[]
  mutualFriends: InstagramList[]
}

type TabType = 'followers' | 'following' | 'blocked' | 'pending' | 'recent' | 'unfollowed' | 'removed' | 'unfollowers' | 'notFollowedBack' | 'mutualFriends'

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc'

export default function InstagramLists({
  followers,
  following,
  blockedProfiles,
  pendingFollowRequests,
  recentFollowRequests,
  recentlyUnfollowed,
  removedSuggestions,
  unfollowers,
  notFollowedBack,
  mutualFriends
}: InstagramListsProps) {
  const [selectedTab, setSelectedTab] = useState<TabType>('followers')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')
  const itemsPerPage = 10
  const { toast } = useToast()

  const tabs = [
    { id: 'followers' as TabType, label: 'Followers', count: followers.length, icon: Users, color: 'pink', description: 'People who follow you' },
    { id: 'following' as TabType, label: 'Following', count: following.length, icon: UserPlus, color: 'purple', description: 'People you follow' },
    { id: 'mutualFriends' as TabType, label: 'Mutual', count: mutualFriends.length, icon: Heart, color: 'teal', description: 'People you both follow each other with' },
    { id: 'unfollowers' as TabType, label: 'Unfollowers', count: unfollowers.length, icon: UserCheck, color: 'blue', description: 'People you follow who don\'t follow you back' },
    { id: 'notFollowedBack' as TabType, label: 'Not Followed', count: notFollowedBack.length, icon: UserMinus, color: 'cyan', description: 'Followers you haven\'t followed back' },
    { id: 'blocked' as TabType, label: 'Blocked', count: blockedProfiles.length, icon: UserX, color: 'red', description: 'Accounts you have blocked' },
    { id: 'pending' as TabType, label: 'Pending', count: pendingFollowRequests.length, icon: Clock, color: 'orange', description: 'Follow requests waiting for approval' },
    { id: 'recent' as TabType, label: 'Recent Requests', count: recentFollowRequests.length, icon: UserPlus, color: 'green', description: 'Your recent follow requests to others' },
    { id: 'unfollowed' as TabType, label: 'Unfollowed', count: recentlyUnfollowed.length, icon: UserMinus, color: 'yellow', description: 'People you recently unfollowed' },
    { id: 'removed' as TabType, label: 'Removed Suggestions', count: removedSuggestions.length, icon: X, color: 'gray', description: 'Suggested accounts you dismissed' },
  ]

  const getListData = (tab: TabType): InstagramList[] => {
    switch (tab) {
      case 'followers': return followers
      case 'following': return following
      case 'mutualFriends': return mutualFriends
      case 'unfollowers': return unfollowers
      case 'notFollowedBack': return notFollowedBack
      case 'blocked': return blockedProfiles
      case 'pending': return pendingFollowRequests
      case 'recent': return recentFollowRequests
      case 'unfollowed': return recentlyUnfollowed
      case 'removed': return removedSuggestions
      default: return []
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown date'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  /**
   * Highlights search term within text by wrapping matches in a styled span
   */
  const highlightSearchTerm = (text: string, search: string): React.ReactNode => {
    if (!search.trim()) return text

    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-300 dark:bg-yellow-600 text-foreground rounded px-0.5"
        >
          {part}
        </mark>
      ) : part
    )
  }

  const sortList = (list: InstagramList[]): InstagramList[] => {
    return [...list].sort((a, b) => {
      let comparison = 0

      if (sortOption.startsWith('name')) {
        const nameA = a.username?.toLowerCase() || ''
        const nameB = b.username?.toLowerCase() || ''
        comparison = nameA.localeCompare(nameB)
      } else if (sortOption.startsWith('date')) {
        const dateA = a.timestamp || 0
        const dateB = b.timestamp || 0
        comparison = dateA - dateB
      }

      return sortOption.endsWith('asc') ? comparison : -comparison
    })
  }

  const filteredList = sortList(
    getListData(selectedTab).filter(item =>
      item.username && item.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredList.slice(startIndex, endIndex)

  const handleTabChange = (tab: TabType) => {
    setSelectedTab(tab)
    setCurrentPage(1)
    setSearchTerm('')
    setSortOption('date-desc')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const copyToClipboard = async (username: string) => {
    try {
      await navigator.clipboard.writeText(username)
      toast({
        title: "✓ Copied to clipboard",
        description: username,
      })
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = username
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast({
        title: "✓ Copied to clipboard",
        description: username,
      })
    }
  }

  // Generate responsive page numbers based on screen size
  const getVisiblePages = () => {
    const delta = 1
    const rangeWithDots = []

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    rangeWithDots.push(1)

    if (currentPage - delta > 2) {
      rangeWithDots.push('...')
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      rangeWithDots.push(i)
    }

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...')
    }

    if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => {
      return arr.indexOf(item) === index || item === '...'
    })
  }

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const neutralBorder = 'border-2 border-slate-300 dark:border-slate-700'
    const colorMap: Record<string, string> = {
      pink: isActive
        ? 'border-2 border-pink-500 text-pink-700 dark:text-pink-500'
        : `${neutralBorder} text-pink-600 dark:text-pink-400 hover:border-pink-500 dark:hover:border-pink-400 transition-colors delay-75 duration-200`,
      purple: isActive
        ? 'border-2 border-purple-500 text-purple-700 dark:text-purple-500'
        : `${neutralBorder} text-purple-600 dark:text-purple-400 hover:border-purple-500 dark:hover:border-purple-400 transition-colors delay-75 duration-200`,
      teal: isActive
        ? 'border-2 border-teal-500 text-teal-700 dark:text-teal-500'
        : `${neutralBorder} text-teal-600 dark:text-teal-400 hover:border-teal-500 dark:hover:border-teal-400 transition-colors delay-75 duration-200`,
      blue: isActive
        ? 'border-2 border-blue-500 text-blue-700 dark:text-blue-500'
        : `${neutralBorder} text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-400 transition-colors delay-75 duration-200`,
      cyan: isActive
        ? 'border-2 border-cyan-500 text-cyan-700 dark:text-cyan-500'
        : `${neutralBorder} text-cyan-600 dark:text-cyan-400 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors delay-75 duration-200`,
      red: isActive
        ? 'border-2 border-red-500 text-red-700 dark:text-red-500'
        : `${neutralBorder} text-red-600 dark:text-red-400 hover:border-red-500 dark:hover:border-red-400 transition-colors delay-75 duration-200`,
      orange: isActive
        ? 'border-2 border-orange-500 text-orange-700 dark:text-orange-500'
        : `${neutralBorder} text-orange-600 dark:text-orange-400 hover:border-orange-500 dark:hover:border-orange-400 transition-colors delay-75 duration-200`,
      green: isActive
        ? 'border-2 border-green-500 text-green-700 dark:text-green-500'
        : `${neutralBorder} text-green-600 dark:text-green-400 hover:border-green-500 dark:hover:border-green-400 transition-colors delay-75 duration-200`,
      yellow: isActive
        ? 'border-2 border-yellow-500 text-yellow-700 dark:text-yellow-500'
        : `${neutralBorder} text-yellow-600 dark:text-yellow-400 hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors delay-75 duration-200`,
      gray: isActive
        ? 'border-2 border-indigo-500 text-indigo-700 dark:text-indigo-500'
        : `${neutralBorder} text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors delay-75 duration-200`,
    }
    return colorMap[color] || colorMap.gray
  }

  return (
    <>
      {/* Combined Stats and List Display */}
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>
            Click on any statistic to view the detailed list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabs.slice(0, 4).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`text-center p-4 rounded-lg cursor-pointer ${getColorClasses(tab.color, selectedTab === tab.id)}`}
              >
                <div className="text-2xl font-bold">
                  {tab.count}
                </div>
                <div className="text-sm text-muted-foreground">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Additional stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {tabs.slice(4, 8).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`text-center p-4 rounded-lg cursor-pointer ${getColorClasses(tab.color, selectedTab === tab.id)}`}
              >
                <div className="text-2xl font-bold">
                  {tab.count}
                </div>
                <div className="text-sm text-muted-foreground">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Third stats row for remaining tabs */}
          {tabs.length > 8 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {tabs.slice(8).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`text-center p-4 rounded-lg cursor-pointer ${getColorClasses(tab.color, selectedTab === tab.id)}`}
                >
                  <div className="text-2xl font-bold">
                    {tab.count}
                  </div>
                  <div className="text-sm text-muted-foreground">{tab.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Selected List Display */}
          {selectedTab && (
            <div key={selectedTab} className="mt-8">
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    {tabs.find(t => t.id === selectedTab)?.label} ({getListData(selectedTab).length})
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tabs.find(t => t.id === selectedTab)?.description}
                </p>
              </div>
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                    <Input
                      placeholder={`Search ${tabs.find(t => t.id === selectedTab)?.label.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-10 h-10 bg-card/50 dark:bg-card/40 backdrop-blur-sm border-2 border-border/60 dark:border-border/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 transition-all"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground whitespace-nowrap hidden sm:inline">Sort by:</span>
                    <Select
                      value={sortOption}
                      onValueChange={(value: SortOption) => {
                        setSortOption(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="h-10 sm:w-[200px] w-full bg-card/50 dark:bg-card/40 backdrop-blur-sm border-2 border-border/60 dark:border-border/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card/95 dark:bg-card/95 backdrop-blur-md border-2 border-border/60 dark:border-border/50">
                        <SelectItem value="date-desc">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-3 w-3" />
                            Date (Newest First)
                          </div>
                        </SelectItem>
                        <SelectItem value="date-asc">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="h-3 w-3" />
                            Date (Oldest First)
                          </div>
                        </SelectItem>
                        <SelectItem value="name-asc">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="h-3 w-3" />
                            Name (A-Z)
                          </div>
                        </SelectItem>
                        <SelectItem value="name-desc">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-3 w-3" />
                            Name (Z-A)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Results */}
              {currentItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {currentItems.map((item, index) => {
                      if (!item.username) return null;

                      return (
                        <div
                          key={`${selectedTab}-${item.username}-${index}`}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer select-none animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                          onClick={() => copyToClipboard(item.username)}
                          title={`Click to copy "${item.username}" to clipboard`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {item.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate" title={item.username}>
                                  {highlightSearchTerm(item.username, searchTerm)}
                                </div>
                                {item.timestamp && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{formatDate(item.timestamp)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {item.href && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(item.href, '_blank')
                                }}
                                className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
                              >
                                <span className="hidden sm:inline">View Profile</span>
                                <span className="sm:hidden">View</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent className="gap-1">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={cn(
                              currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                              'hidden sm:flex'
                            )}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="sm:hidden h-8 w-8"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </PaginationItem>

                        {getVisiblePages().map((page, index) => (
                          <PaginationItem key={index}>
                            {page === '...' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => handlePageChange(page as number)}
                                isActive={currentPage === page}
                                className="cursor-pointer h-8 w-8 text-sm"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={cn(
                              currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                              'hidden sm:flex'
                            )}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="sm:hidden h-8 w-8"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}

                  {/* Results info */}
                  <div className="text-center text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredList.length)} of {filteredList.length} {tabs.find(t => t.id === selectedTab)?.label.toLowerCase()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-2">
                    {searchTerm ? 'No results found' : 'No data available'}
                  </div>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}