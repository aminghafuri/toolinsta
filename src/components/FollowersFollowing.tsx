"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Search } from "lucide-react"

interface FollowersFollowingProps {
  followers: string[]
  following: string[]
}

const FollowersFollowing = ({ followers, following }: FollowersFollowingProps) => {
  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>('followers')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredList = selectedTab === 'followers' 
    ? followers.filter(user => user.toLowerCase().includes(searchTerm.toLowerCase()))
    : following.filter(user => user.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Followers & Following
          </CardTitle>
          <CardDescription>
            View your Instagram followers and following lists
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={selectedTab === 'followers' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('followers')}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Followers ({followers.length})
        </Button>
        <Button
          variant={selectedTab === 'following' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('following')}
        >
          <Users className="h-4 w-4 mr-2" />
          Following ({following.length})
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${selectedTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedTab === 'followers' ? 'Followers' : 'Following'} 
            <Badge variant="secondary" className="ml-2">
              {filteredList.length} of {selectedTab === 'followers' ? followers.length : following.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredList.map((username, index) => (
                <div
                  key={`${selectedTab}-${username}-${index}`}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm truncate">@{username}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No users found matching your search.' : `No ${selectedTab} found.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FollowersFollowing
