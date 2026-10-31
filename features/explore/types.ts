export interface Festival {
  id: string;
  name: string;
  location: string;
  description: string;
  established_year: number;
}

export interface Studio {
  id: string;
  name: string;
  type: 'indie' | 'mainstream' | 'regional' | 'collective';
  verified: boolean;
}

export interface NationalArtist {
  id: string;
  name: string;
  conferment_year: number;
  notable_films: string[];
}

export interface ExploreData {
  festivals: Festival[];
  studios: Studio[];
  heritageArtists: NationalArtist[];
  genres: string[];
}

