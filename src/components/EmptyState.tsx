'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
    FileQuestion,
    RefreshCcw,
    Upload,
    LucideIcon
} from 'lucide-react'

interface EmptyStateProps {
    /** Title for the empty state */
    title: string
    /** Icon to display */
    icon?: LucideIcon
    /** Whether the data is from a summary (after page refresh due to storage limits) */
    isSummary?: boolean
    /** Custom description - if not provided, will show default based on isSummary */
    description?: string
}

/**
 * A beautiful, modern empty state component that explains why data is not available.
 * It distinguishes between two scenarios:
 * 1. Data wasn't in the uploaded ZIP file
 * 2. Page was refreshed and data couldn't be stored due to storage limitations
 */
export default function EmptyState({
    title,
    icon: Icon = FileQuestion,
    isSummary = false,
    description
}: EmptyStateProps) {
    const defaultDescription = isSummary
        ? "This data couldn't be restored after page refresh due to browser storage limits. Please re-upload your ZIP file to view this section."
        : "This data wasn't found in your uploaded ZIP file. It may not be included in your Instagram data export."

    const ReasonIcon = isSummary ? RefreshCcw : Upload

    return (
        <Card className="overflow-hidden border-dashed">
            <CardContent className="p-0">
                <div className="relative">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-muted/10 to-transparent" />

                    {/* Content */}
                    <div className="relative px-6 py-10 sm:py-12 flex flex-col items-center text-center space-y-4">
                        {/* Icon Container with animated gradient ring */}
                        <div className="relative">
                            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 blur-md animate-pulse" />
                            <div className="relative w-16 h-16 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 flex items-center justify-center">
                                <Icon className="w-7 h-7 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-foreground">
                            {title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                            {description || defaultDescription}
                        </p>

                        {/* Reason Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
                            <ReasonIcon className="w-3.5 h-3.5" />
                            <span>
                                {isSummary ? 'Data not restored after refresh' : 'Not included in export'}
                            </span>
                        </div>

                        {/* Hint for summary mode */}
                        {isSummary && (
                            <div className="mt-2 pt-4 border-t border-border/30 w-full max-w-sm">
                                <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1.5">
                                    <Upload className="w-3 h-3" />
                                    Re-upload your ZIP file to view this data
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
