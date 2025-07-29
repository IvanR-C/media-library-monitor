"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { RemuxModal } from "@/components/remux-modal";
import { ConfigModal } from "@/components/config-modal";
import { TrackTooltip } from "@/components/track-tooltip";
import {
  Film,
  HardDrive,
  Languages,
  FileVideo,
  ExternalLink,
  RefreshCw,
  Settings,
  Volume2,
  Subtitles,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { scanDirectory, remuxFile } from "./actions";
import type { MediaFile } from "./types";

export default function MediaLibraryInspector() {
  const [path, setPath] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [remuxing, setRemuxing] = useState<string | null>(null);
  const [remuxModalOpen, setRemuxModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [handbrakeUrl, setHandbrakeUrl] = useState("http://localhost:8080");

  // Load handbrake URL from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("handbrake-url");
    if (savedUrl) {
      setHandbrakeUrl(savedUrl);
    }
  }, []);

  const handleScan = async () => {
    if (!path.trim()) return;

    setLoading(true);
    try {
      const files = await scanDirectory(path);
      setMediaFiles(files);
    } catch (error) {
      console.error("Error scanning directory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemuxClick = (file: MediaFile) => {
    setSelectedFile(file);
    setRemuxModalOpen(true);
  };

  const handleRemuxConfirm = async (
    filePath: string,
    languageUpdates: Record<string, string>,
  ) => {
    setRemuxModalOpen(false);
    setRemuxing(filePath);
    try {
      await remuxFile(filePath, languageUpdates);
      // Refresh the file list after remux
      await handleScan();
    } catch (error) {
      console.error("Error remuxing file:", error);
    } finally {
      setRemuxing(null);
    }
  };

  const handleReencode = (filePath: string) => {
    const url = `${handbrakeUrl}/?source=${encodeURIComponent(filePath)}`;
    window.open(url, "_blank");
  };

  const handleConfigSave = (newHandbrakeUrl: string) => {
    setHandbrakeUrl(newHandbrakeUrl);
    localStorage.setItem("handbrake-url", newHandbrakeUrl);
    setConfigModalOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 ** 3).toFixed(1);
  };

  const getRecommendations = (file: MediaFile) => {
    const recommendations = [];

    // Check for unknown languages
    const hasUnknownAudio = file.audioTracks.some(
      (track) =>
        !track.language ||
        track.language === "und" ||
        track.language === "unknown",
    );
    const hasUnknownSubtitles = file.subtitleTracks.some(
      (track) =>
        !track.language ||
        track.language === "und" ||
        track.language === "unknown",
    );

    if (hasUnknownAudio || hasUnknownSubtitles) {
      recommendations.push("remux");
    }

    // Check file size > 20GB
    if (file.sizeGB > 20) {
      recommendations.push("reencode");
    }

    // Check if format is not mkv or mp4
    const format = file.format.toLowerCase();
    if (
      !format.includes("matroska") &&
      !format.includes("mp4") &&
      !format.includes("mov")
    ) {
      recommendations.push("reencode");
    }

    return recommendations;
  };

  // const getUnknownTracksCount = (file: MediaFile) => {
  //   const unknownAudio = file.audioTracks.filter(
  //     (track) =>
  //       !track.language ||
  //       track.language === "und" ||
  //       track.language === "unknown",
  //   ).length;
  //   const unknownSubtitles = file.subtitleTracks.filter(
  //     (track) =>
  //       !track.language ||
  //       track.language === "und" ||
  //       track.language === "unknown",
  //   ).length;
  //   return unknownAudio + unknownSubtitles;
  // };

  const getFormatBadgeVariant = (format: string) => {
    const f = format.toLowerCase();
    if (f.includes("matroska") || f.includes("mp4") || f.includes("mov")) {
      return "default";
    }
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Film className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">Media Library Inspector</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setConfigModalOpen(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="/movies or /home/user/media (try any path for demo)"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                className="flex-1"
              />
              <Button onClick={handleScan} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Scan"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Demo version - Enter any path to see sample media files
            </p>
          </CardContent>
        </Card>

        {mediaFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Found {mediaFiles.length} files
              </h2>
              <div className="text-sm text-muted-foreground">
                {
                  mediaFiles.filter((f) => getRecommendations(f).length > 0)
                    .length
                }{" "}
                need attention
              </div>
            </div>

            <div className="space-y-1">
              {mediaFiles.map((file, index) => {
                const recommendations = getRecommendations(file);
                // const unknownCount = getUnknownTracksCount(file);
                const hasIssues = recommendations.length > 0;

                return (
                  <Card
                    key={index}
                    className={`transition-colors h-16 ${hasIssues ? "border-orange-200 dark:border-orange-800" : ""}`}
                  >
                    <CardContent className="p-3 h-full">
                      <div className="flex items-center h-full gap-3">
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {hasIssues ? (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>

                        {/* File Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileVideo className="h-4 w-4 flex-shrink-0" />
                            <h3 className="font-medium text-sm truncate">
                              {file.name}
                            </h3>
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {file.path.split("/").slice(-2, -1)[0] || ""}
                          </div>
                        </div>

                        {/* File Size */}
                        <div className="flex-shrink-0 text-center min-w-[60px]">
                          <div className="flex items-center gap-1 text-xs">
                            <HardDrive className="h-3 w-3" />
                            <span className="font-medium">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            GB
                          </div>
                        </div>

                        {/* Audio Tracks */}
                        <div className="flex-shrink-0 min-w-[50px]">
                          <TrackTooltip tracks={file.audioTracks} type="audio">
                            <div className="flex items-center gap-1 text-xs cursor-help">
                              <Volume2 className="h-3 w-3" />
                              <span className="font-medium">
                                {file.audioTracks.length}
                              </span>
                              {file.audioTracks.some(
                                (t) =>
                                  !t.language ||
                                  t.language === "und" ||
                                  t.language === "unknown",
                              ) && <span className="text-orange-500">!</span>}
                            </div>
                          </TrackTooltip>
                        </div>

                        {/* Subtitle Tracks */}
                        <div className="flex-shrink-0 min-w-[50px]">
                          <TrackTooltip
                            tracks={file.subtitleTracks}
                            type="subtitle"
                          >
                            <div className="flex items-center gap-1 text-xs cursor-help">
                              <Subtitles className="h-3 w-3" />
                              <span className="font-medium">
                                {file.subtitleTracks.length}
                              </span>
                              {file.subtitleTracks.some(
                                (t) =>
                                  !t.language ||
                                  t.language === "und" ||
                                  t.language === "unknown",
                              ) && <span className="text-orange-500">!</span>}
                            </div>
                          </TrackTooltip>
                        </div>

                        {/* Format */}
                        <div className="flex-shrink-0">
                          <Badge
                            variant={getFormatBadgeVariant(file.format)}
                            className="text-xs px-2 py-0.5 h-5"
                          >
                            {file.format
                              .split(",")[0]
                              .replace("matroska", "MKV")
                              .toUpperCase()}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex gap-1 min-w-[80px] justify-end">
                          {recommendations.includes("remux") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemuxClick(file)}
                              disabled={remuxing === file.path}
                              className="h-6 px-2 text-xs"
                              title="Fix language tags"
                            >
                              {remuxing === file.path ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Languages className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          {recommendations.includes("reencode") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReencode(file.path)}
                              className="h-6 px-2 text-xs"
                              title="Re-encode in HandBrake"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {mediaFiles.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Enter a directory path and click &quot;Scan&quot; to inspect
                your media library
              </p>
            </CardContent>
          </Card>
        )}

        <RemuxModal
          open={remuxModalOpen}
          onOpenChange={setRemuxModalOpen}
          file={selectedFile}
          onConfirm={handleRemuxConfirm}
        />

        <ConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          handbrakeUrl={handbrakeUrl}
          onSave={handleConfigSave}
        />
      </div>
    </div>
  );
}
