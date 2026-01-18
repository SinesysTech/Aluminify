'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-3 mt-0.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Heatmap Skeleton */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded" />
        </CardContent>
      </Card>

      {/* Two-column sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex flex-col gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex flex-col gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
