'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

interface LocationsOfInterestProps {
  locations: string[]
}

export default function LocationsOfInterest({ locations }: LocationsOfInterestProps) {
  if (!locations || locations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Locations of Interest
        </CardTitle>
        <CardDescription>
          Places Instagram has identified as relevant to you based on your activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {locations.map((location, index) => (
            <Badge key={index} variant="outline" className="text-sm">
              {location}
            </Badge>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          These locations are used to personalize your experience on Instagram and show you more relevant ads.
        </div>
      </CardContent>
    </Card>
  )
}
