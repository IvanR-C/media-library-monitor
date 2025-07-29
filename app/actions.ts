"use server"

import type { MediaFile } from "./types"

// Sample media files for demo purposes
const additionalSampleFiles: MediaFile[] = [
  {
    name: "Old Movie (1995).avi",
    path: "/movies/Old Movie (1995).avi",
    size: 1.4 * 1024 ** 3, // 1.4 GB
    sizeGB: 1.4,
    format: "avi", // Not mkv or mp4 - needs re-encoding
    duration: 6720, // 1h 52m
    audioTracks: [{ codec: "mp3", language: "eng", channels: 2 }],
    subtitleTracks: [],
  },
  {
    name: "Documentary (2020).wmv",
    path: "/movies/Documentary (2020).wmv",
    size: 3.2 * 1024 ** 3, // 3.2 GB
    sizeGB: 3.2,
    format: "asf", // Not mkv or mp4 - needs re-encoding
    duration: 5400, // 1h 30m
    audioTracks: [
      { codec: "wmav2", language: "und", channels: 2 }, // Unknown language - needs remux
    ],
    subtitleTracks: [
      { codec: "srt", language: "unknown" }, // Unknown language - needs remux
    ],
  },
]

const sampleMediaFiles: MediaFile[] = [
  {
    name: "The Matrix (1999).mkv",
    path: "/movies/The Matrix (1999).mkv",
    size: 15.2 * 1024 ** 3, // 15.2 GB
    sizeGB: 15.2,
    format: "matroska,webm",
    duration: 8160, // 2h 16m
    audioTracks: [
      { codec: "dts", language: "eng", channels: 6 },
      { codec: "ac3", language: "spa", channels: 6 },
      { codec: "aac", language: "und", channels: 2 }, // Unknown language - needs remux
    ],
    subtitleTracks: [
      { codec: "subrip", language: "eng" },
      { codec: "subrip", language: "spa" },
      { codec: "subrip", language: "und" }, // Unknown language - needs remux
    ],
  },
  {
    name: "Blade Runner 2049 (2017).mkv",
    path: "/movies/Blade Runner 2049 (2017).mkv",
    size: 25.8 * 1024 ** 3, // 25.8 GB - needs re-encoding
    sizeGB: 25.8,
    format: "matroska,webm",
    duration: 9840, // 2h 44m
    audioTracks: [
      { codec: "truehd", language: "eng", channels: 8 },
      { codec: "ac3", language: "eng", channels: 6 },
    ],
    subtitleTracks: [
      { codec: "pgs", language: "eng" },
      { codec: "pgs", language: "fre" },
    ],
  },
  {
    name: "Inception (2010).mp4",
    path: "/movies/Inception (2010).mp4",
    size: 8.4 * 1024 ** 3, // 8.4 GB
    sizeGB: 8.4,
    format: "mov,mp4,m4a,3gp,3g2,mj2",
    duration: 8880, // 2h 28m
    audioTracks: [{ codec: "aac", language: "eng", channels: 6 }],
    subtitleTracks: [], // No subtitles
  },
  {
    name: "Interstellar (2014).mkv",
    path: "/movies/Interstellar (2014).mkv",
    size: 22.1 * 1024 ** 3, // 22.1 GB - needs re-encoding
    sizeGB: 22.1,
    format: "matroska,webm",
    duration: 10140, // 2h 49m
    audioTracks: [
      { codec: "dts", language: "unknown", channels: 6 }, // Unknown language - needs remux
      { codec: "ac3", language: "eng", channels: 6 },
    ],
    subtitleTracks: [
      { codec: "subrip", language: "eng" },
      { codec: "subrip", language: "unknown" }, // Unknown language - needs remux
    ],
  },
  {
    name: "Dune (2021).mkv",
    path: "/movies/Dune (2021).mkv",
    size: 12.7 * 1024 ** 3, // 12.7 GB
    sizeGB: 12.7,
    format: "matroska,webm",
    duration: 9360, // 2h 36m
    audioTracks: [
      { codec: "eac3", language: "eng", channels: 8 },
      { codec: "ac3", language: "fre", channels: 6 },
    ],
    subtitleTracks: [
      { codec: "subrip", language: "eng" },
      { codec: "subrip", language: "fre" },
      { codec: "subrip", language: "ger" },
    ],
  },
  ...additionalSampleFiles,
]

export async function scanDirectory(dirPath: string): Promise<MediaFile[]> {
  // Simulate scanning delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return sample files for demo
  return sampleMediaFiles.map((file) => ({
    ...file,
    path: file.path.replace("/movies", dirPath),
  }))
}

export async function remuxFile(filePath: string, languageUpdates: Record<string, string>): Promise<void> {
  // Simulate remux process
  await new Promise((resolve) => setTimeout(resolve, 3000))

  console.log(`Demo: Remuxing file ${filePath}`)
  console.log("Language updates:", languageUpdates)
  console.log("In a real implementation, this would:")
  console.log("1. Use ffmpeg to remux the file with updated language tags")
  console.log("2. Apply the language mappings to the appropriate tracks")
  console.log("3. Save the remuxed file with '_remuxed' suffix")

  // Example ffmpeg command that would be generated:
  const trackMappings = Object.entries(languageUpdates)
    .map(([key, lang]) => {
      const [type, index] = key.split("_")
      return `-metadata:s:${type === "audio" ? "a" : "s"}:${index} language=${lang}`
    })
    .join(" ")

  console.log(
    `Generated ffmpeg command: ffmpeg -i "${filePath}" -c copy ${trackMappings} "${filePath.replace(/(\.[^.]+)$/, "_remuxed$1")}"`,
  )
}
