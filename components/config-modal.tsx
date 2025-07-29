"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Settings, ExternalLink, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handbrakeUrl: string
  onSave: (handbrakeUrl: string) => void
}

export function ConfigModal({ open, onOpenChange, handbrakeUrl, onSave }: ConfigModalProps) {
  const [tempUrl, setTempUrl] = useState(handbrakeUrl)

  useEffect(() => {
    if (open) {
      setTempUrl(handbrakeUrl)
    }
  }, [open, handbrakeUrl])

  const handleSave = () => {
    onSave(tempUrl)
  }

  const handleReset = () => {
    setTempUrl("http://localhost:8080")
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </DialogTitle>
          <DialogDescription>Configure the application settings and external tool integrations.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handbrake-url" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              HandBrake Web UI URL
            </Label>
            <Input
              id="handbrake-url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://localhost:8080"
              className={!isValidUrl(tempUrl) && tempUrl ? "border-destructive" : ""}
            />
            {!isValidUrl(tempUrl) && tempUrl && <p className="text-sm text-destructive">Please enter a valid URL</p>}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>HandBrake Setup:</strong>
              <br />
              1. Install HandBrake and enable the web interface
              <br />
              2. Start HandBrake with: <code className="bg-muted px-1 rounded">--server --preset-import-gui</code>
              <br />
              3. The default URL is usually <code className="bg-muted px-1 rounded">http://localhost:8080</code>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Current Settings:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                HandBrake URL: <code className="bg-background px-1 rounded">{handbrakeUrl}</code>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValidUrl(tempUrl)}>
              Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
