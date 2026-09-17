import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { cn } from "@/lib/utils";

/**
 * Resolves one storage id into a URL and renders it. Each instance runs a
 * single reactive query — safe to map over a list of ids.
 */
export function StorageImage({
  id,
  alt,
  className,
  eager = false,
}: {
  id: Id<"_storage">;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const url = useQuery(api.files.imageUrl, { id });

  if (!url) {
    return (
      <div
        className={cn(
          "size-full animate-pulse rounded-md bg-muted",
          className,
        )}
      />
      );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className={cn("size-full object-cover", className)}
    />
  );
}
