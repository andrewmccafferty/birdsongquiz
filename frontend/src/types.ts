export interface SpeciesEntry {
  Species: string
  ScientificName: string
}

export interface RecordingInfo {
  id: string
  en: string
  rec: string
  gen: string
  sp: string
}

export interface RecordingApiResponse {
  noRecordings?: boolean
  recording?: RecordingInfo
  soundUrl?: string
}

export interface SpeciesListResponse {
  species: SpeciesEntry[]
}

export interface PresetList {
  id: string
  name: string
}

export interface PresetsApiResponse {
  presets: PresetList[]
}

export type SoundType = "any" | "song" | "call"
