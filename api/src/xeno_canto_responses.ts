export interface XenoCantoResponse {
  numRecordings: string;
  numSpecies: string;
  page: number;
  numPages: number;
  recordings: Recording[];
}

export interface Recording {
  id: string;
  gen: string;
  sp: string;
  ssp: string;
  grp: string;
  en: string;
  rec: string;
  cnt: string;
  loc: string;
  lat: string;
  lon: string;
  alt: string;
  type: string;
  sex: string;
  stage: string;
  method: string;
  url: string;
  file: string;
  "file-name": string;
  sono: Sono;
  osci: Osci;
  lic: string;
  q: string;
  length: string;
  time: string;
  date: string;
  uploaded: string;
  also: string[];
  rmk: string;
  "animal-seen": string;
  "playback-used": string;
  temp: string;
  regnr: string;
  auto: string;
  dvc: string;
  mic: string;
  smp: string;
}

export interface Sono {
  small: string;
  med: string;
  large: string;
  full: string;
}

export interface Osci {
  small: string;
  med: string;
  large: string;
}
