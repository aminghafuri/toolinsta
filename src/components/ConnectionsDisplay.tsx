"use client"

import { useConnectionsData } from "@/hooks/useConnectionsData"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserCheck, UserX, Clock, AlertCircle, Trash2 } from "lucide-react"

const ConnectionsDisplay = () => {
  const { data, loading, error, clearData } = useConnectionsData()

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading connections data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No connections data available. Please upload a ZIP file to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* User Info */}
      {data.userData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="text-lg">{data.userData.username}</p>
              </div>
              {data.userData.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{data.userData.email}</p>
                </div>
              )}
              {data.userData.bio && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Bio</p>
                  <p className="text-lg">{data.userData.bio}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{data.followers.length}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{data.following.length}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{data.unfollowers.length}</p>
                <p className="text-sm text-muted-foreground">Unfollowers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{data.blockedProfiles.length}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked Profiles</CardTitle>
            <CardDescription>
              {data.blockedProfiles.length} blocked profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.blockedProfiles.length > 0 ? (
              <div className="space-y-1">
                {data.blockedProfiles.slice(0, 5).map((profile, index) => (
                  <p key={index} className="text-sm">@{profile.username}</p>
                ))}
                {data.blockedProfiles.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {data.blockedProfiles.length - 5} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No blocked profiles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
            <CardDescription>
              {data.pendingFollowRequests.length} pending follow requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.pendingFollowRequests.length > 0 ? (
              <div className="space-y-1">
                {data.pendingFollowRequests.slice(0, 5).map((request, index) => (
                  <p key={index} className="text-sm">@{request.username}</p>
                ))}
                {data.pendingFollowRequests.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {data.pendingFollowRequests.length - 5} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending requests</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Storage Information</CardTitle>
          <CardDescription>
            Only essential connections data is stored (much smaller than full data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Stored data:</span> User info, followers, following, unfollowers, blocked profiles, pending requests
            </p>
            <p className="text-sm">
              <span className="font-medium">Excluded data:</span> Media files, posts, stories, raw extracted files
            </p>
            <p className="text-sm text-muted-foreground">
              Extraction date: {new Date(data.extractionDate).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data Button */}
      <div className="flex justify-center">
        <Button
          variant="destructive"
          onClick={clearData}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Connections Data
        </Button>
      </div>
    </div>
  )
}

export default ConnectionsDisplay
