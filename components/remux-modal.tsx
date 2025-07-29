"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Languages, Volume2, Subtitles } from "lucide-react"
import type { MediaFile } from "@/app/types"

interface RemuxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: MediaFile | null
  onConfirm: (filePath: string, languageUpdates: Record<string, string>) => void
}

// Common language options
const languageOptions = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Spanish" },
  { code: "fre", name: "French" },
  { code: "ger", name: "German" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
  { code: "rus", name: "Russian" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "chi", name: "Chinese" },
  { code: "ara", name: "Arabic" },
  { code: "hin", name: "Hindi" },
  { code: "dut", name: "Dutch" },
  { code: "swe", name: "Swedish" },
  { code: "nor", name: "Norwegian" },
  { code: "dan", name: "Danish" },
  { code: "fin", name: "Finnish" },
  { code: "pol", name: "Polish" },
  { code: "cze", name: "Czech" },
  { code: "hun", name: "Hungarian" },
]

export function RemuxModal({ open, onOpenChange, file, onConfirm }: RemuxModalProps) {
  const [languageUpdates, setLanguageUpdates] = useState<Record<string, string>>({})

  useEffect(() => {
    if (file && open) {
      // Reset language updates when modal opens
      setLanguageUpdates({})
    }
  }, [file, open])

  if (!file) return null

  const unknownAudioTracks = file.audioTracks.filter(
    (track, index) => !track.language || track.language === "und" || track.language === "unknown",
  )

  const unknownSubtitleTracks = file.subtitleTracks.filter(
    (track, index) => !track.language || track.language === "und" || track.language === "unknown",
  )

  const handleLanguageChange = (trackType: string, trackIndex: number, language: string) => {
    const key = `${trackType}_${trackIndex}`
    setLanguageUpdates((prev) => ({
      ...prev,
      [key]: language,
    }))
  }

  const handleConfirm = () => {
    onConfirm(file.path, languageUpdates)
  }

  const hasUnknownTracks = unknownAudioTracks.length > 0 || unknownSubtitleTracks.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Fix Language Tags - {file.name}
          </DialogTitle>
          <DialogDescription>
            Set the correct language for tracks with unknown or missing language tags. This will help media players
            properly identify and display track information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {unknownAudioTracks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Tracks with Unknown Languages
              </h3>
              <div className="space-y-3">
                {unknownAudioTracks.map((track, index) => {
                  const originalIndex = file.audioTracks.findIndex((t) => t === track)
                  const key = `audio_${originalIndex}`

                  return (
                    <div key={originalIndex} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Track {originalIndex + 1}</Badge>
                        <div>
                          <p className="font-medium">{track.codec.toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{track.channels} channels</p>
                        </div>
                      </div>
                      <Select
                        value={languageUpdates[key] || ""}
                        onValueChange={(value) => handleLanguageChange("audio", originalIndex, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {unknownSubtitleTracks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Subtitles className="h-4 w-4" />
                Subtitle Tracks with Unknown Languages
              </h3>
              <div className="space-y-3">
                {unknownSubtitleTracks.map((track, index) => {
                  const originalIndex = file.subtitleTracks.findIndex((t) => t === track)
                  const key = `subtitle_${originalIndex}`

                  return (
                    <div key={originalIndex} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Track {originalIndex + 1}</Badge>
                        <div>
                          <p className="font-medium">{track.codec.toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">Subtitle</p>
                        </div>
                      </div>
                      <Select
                        value={languageUpdates[key] || ""}
                        onValueChange={(value) => handleLanguageChange("subtitle", originalIndex, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!hasUnknownTracks && (
            <div className="text-center py-8">
              <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tracks with unknown languages found in this file.</p>
            </div>
          )}

          {hasUnknownTracks && (
            <>
              <Separator />
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens during remux:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Language tags will be updated for selected tracks</li>
                  <li>• Video and audio streams will be copied without re-encoding</li>
                  <li>• Original file will be preserved</li>
                  <li>• New file will be saved with "_remuxed" suffix</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!hasUnknownTracks || Object.keys(languageUpdates).length === 0}>
            Start Remux
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
