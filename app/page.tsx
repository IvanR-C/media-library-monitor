"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { RemuxModal } from "@/components/remux-modal";
import { ConfigModal } from "@/components/config-modal";
import {
  FolderOpen,
  Film,
  HardDrive,
  Languages,
  FileVideo,
  ExternalLink,
  RefreshCw,
  Settings,
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
    return (bytes / 1024 ** 3).toFixed(2);
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

  const getRecommendationReason = (file: MediaFile, recommendation: string) => {
    if (recommendation === "remux") {
      return "Fix unknown language tags";
    }
    if (recommendation === "reencode") {
      const reasons = [];
      if (file.sizeGB > 20) {
        reasons.push(`Large file size (${formatFileSize(file.size)} GB)`);
      }
      const format = file.format.toLowerCase();
      if (
        !format.includes("matroska") &&
        !format.includes("mp4") &&
        !format.includes("mov")
      ) {
        reasons.push("Unsupported format");
      }
      return reasons.join(", ");
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Media Library Inspector</h1>
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Directory Path
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  "Scan Directory"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is a demo version. Enter any path to see sample media files
              with analysis.
            </p>
          </CardContent>
        </Card>

        {mediaFiles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">
              Found {mediaFiles.length} media files
            </h2>

            {mediaFiles.map((file, index) => {
              const recommendations = getRecommendations(file);

              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileVideo className="h-5 w-5" />
                          {file.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {file.path}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <HardDrive className="h-3 w-3" />
                          {formatFileSize(file.size)} GB
                        </Badge>
                        <Badge variant="secondary">{file.format}</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Audio Tracks ({file.audioTracks.length})
                        </h4>
                        <div className="space-y-1">
                          {file.audioTracks.map((track, i) => (
                            <div
                              key={i}
                              className="text-sm flex items-center justify-between"
                            >
                              <span>{track.codec}</span>
                              <Badge
                                variant={
                                  !track.language || track.language === "und"
                                    ? "destructive"
                                    : "default"
                                }
                                className="text-xs"
                              >
                                {track.language || "Unknown"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Subtitle Tracks ({file.subtitleTracks.length})
                        </h4>
                        <div className="space-y-1">
                          {file.subtitleTracks.length > 0 ? (
                            file.subtitleTracks.map((track, i) => (
                              <div
                                key={i}
                                className="text-sm flex items-center justify-between"
                              >
                                <span>{track.codec}</span>
                                <Badge
                                  variant={
                                    !track.language || track.language === "und"
                                      ? "destructive"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {track.language || "Unknown"}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No subtitles
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {recommendations.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">
                            Recommendations
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {recommendations.includes("remux") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemuxClick(file)}
                                disabled={remuxing === file.path}
                                className="flex-col h-auto py-2"
                              >
                                {remuxing === file.path ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mb-1 animate-spin" />
                                    <span className="text-xs">Remuxing...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-medium">
                                      Remux
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {getRecommendationReason(file, "remux")}
                                    </span>
                                  </>
                                )}
                              </Button>
                            )}
                            {recommendations.includes("reencode") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReencode(file.path)}
                                className="flex-col h-auto py-2"
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    Re-encode
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {getRecommendationReason(file, "reencode")}
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {mediaFiles.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Enter a directory path and click &quot;Scan Directory&quot; to
                inspect your media library
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This demo will show sample files with realistic media analysis
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
