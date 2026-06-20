
export function MealCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white overflow-hidden border border-[var(--color-border)]">
            <div className="h-48 w-full shimmer" />
            <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded-md shimmer" />
                <div className="h-3 w-full rounded-md shimmer" />
                <div className="h-3 w-2/3 rounded-md shimmer" />
                <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-20 rounded-md shimmer" />
                    <div className="h-8 w-8 rounded-full shimmer" />
                </div>
            </div>
        </div>
    )
}