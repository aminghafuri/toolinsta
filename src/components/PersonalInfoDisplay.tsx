'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'

interface PersonalInfoDisplayProps {
  personalInfo: {
    email?: string;
    phoneNumber?: string;
    phoneConfirmed?: boolean;
    phoneConfirmationMethod?: string;
    username?: string;
    name?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
    privateAccount?: boolean;
    profilePhotoUri?: string;
  };
  profilePhotoUrl?: string;
}

export default function PersonalInfoDisplay({ personalInfo, profilePhotoUrl }: PersonalInfoDisplayProps) {
  const {
    email,
    phoneNumber,
    phoneConfirmed,
    phoneConfirmationMethod,
    username,
    name,
    bio,
    gender,
    dateOfBirth,
    privateAccount
  } = personalInfo;

  if (!email && !phoneNumber && !username && !name) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatGender = (gender?: string) => {
    if (!gender) return 'Unknown';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };
  
  // Helper function to decode emoji/unicode characters
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your personal details and account information from Instagram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Photo */}
          {profilePhotoUrl && (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <Image 
                  src={profilePhotoUrl} 
                  alt="Profile Photo" 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">Profile Photo</h3>
                <p className="text-sm text-muted-foreground">From your Instagram account</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {username && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Username</span>
                </div>
                <p className="text-sm">{username}</p>
              </div>
            )}

            {name && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Name</span>
                </div>
                <p className="text-sm">{name}</p>
              </div>
            )}

            {email && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-sm">{email}</p>
              </div>
            )}

            {phoneNumber && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                <p className="text-sm">{phoneNumber}</p>
              </div>
            )}

            {gender && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Gender</span>
                </div>
                <p className="text-sm">{formatGender(gender)}</p>
              </div>
            )}

            {dateOfBirth && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date of Birth</span>
                </div>
                <p className="text-sm">{formatDate(dateOfBirth)}</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Bio</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{decodeEmoji(bio)}</p>
            </div>
          )}

          {/* Account Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Account Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phoneConfirmed !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone Confirmed</span>
                  <Badge variant={phoneConfirmed ? "default" : "secondary"}>
                    {phoneConfirmed ? "Yes" : "No"}
                  </Badge>
                </div>
              )}

              {phoneConfirmationMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confirmation Method</span>
                  <Badge variant="outline">{phoneConfirmationMethod}</Badge>
                </div>
              )}

              {privateAccount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Private Account</span>
                  <div className="flex items-center gap-2">
                    {privateAccount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <Badge variant={privateAccount ? "default" : "secondary"}>
                      {privateAccount ? "Private" : "Public"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
