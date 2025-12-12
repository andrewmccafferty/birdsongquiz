export interface PresetListNameDetails {
  id: string;
  name: string;
}

export interface SpeciesDetail {
  Species: string;
  ScientificName: string;
}

export interface PresetListSuggestion {
  region: string;
  listName: string;
  speciesList: SpeciesDetail[];
}
