"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AudioTrack, SubtitleTrack } from "@/app/types";

interface TrackTooltipProps {
  tracks: AudioTrack[] | SubtitleTrack[];
  type: "audio" | "subtitle";
  children: React.ReactNode;
}

export function TrackTooltip({ tracks, type, children }: TrackTooltipProps) {
  if (tracks.length === 0) {
    return <div>{children}</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium text-xs mb-2 capitalize">
              {type} Tracks
            </div>
            {tracks.map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="text-muted-foreground">
                  {track.codec.toUpperCase()}
                  {"channels" in track &&
                    track.channels &&
                    ` (${track.channels}ch)`}
                </span>
                <Badge
                  variant={
                    !track.language ||
                    track.language === "und" ||
                    track.language === "unknown"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs h-4 px-1"
                >
                  {track.language || "Unknown"}
                </Badge>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
