"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InstagramUser } from "@/types/instagram"
import { User, Mail, Phone, Users, Heart, Camera, MapPin } from "lucide-react"
import Image from "next/image"

interface UserProfileProps {
  user: InstagramUser
}

const UserProfile = ({ user }: UserProfileProps) => {
  const formatNumber = (num?: number) => {
    if (!num) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          {user.profile_pic_url ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
              <Image
                src={user.profile_pic_url}
                alt={`${user.username}'s profile`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          <div className="space-y-2">
            <CardTitle className="text-2xl">@{user.username}</CardTitle>
            {user.bio && (
              <CardDescription className="text-base max-w-md">
                {user.bio}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{formatNumber(user.followers_count)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{formatNumber(user.following_count)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{formatNumber(user.media_count)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
        </div>

        {/* Contact Information */}
        {(user.email || user.phone) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="space-y-2">
              {user.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            Instagram Account
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfile
