import { supabase } from '@/lib/supabase';
import { ExploreData } from './types';

const SAMPLE_EXPLORE_DATA: ExploreData = {
  festivals: [
    {
      id: 'fest-1',
      name: 'Cinemalaya Philippine Independent Film Festival',
      location: 'Manila, Philippines',
      description: 'Pioneering platform for full-length and short independent Filipino films.',
      established_year: 2005,
    },
    {
      id: 'fest-2',
      name: 'QCinema International Film Festival',
      location: 'Quezon City',
      description: 'Premier festival celebrating boundary-pushing cinema in Metro Manila.',
      established_year: 2013,
    },
    {
      id: 'fest-3',
      name: 'Cinema Rehiyon',
      location: 'Bacolod / Regions',
      description: 'Flagship non-competition festival celebrating films from the Philippine regions.',
      established_year: 2009,
    },
  ],
  studios: [
    { id: 'st-1', name: 'TBA Studios', type: 'indie', verified: true },
    { id: 'st-2', name: 'Black Sheep', type: 'mainstream', verified: true },
    { id: 'st-3', name: 'Sine Olivia Pilipinas', type: 'indie', verified: true },
    { id: 'st-4', name: 'Anima Studios', type: 'indie', verified: true },
  ],
  heritageArtists: [
    {
      id: 'na-1',
      name: 'Lino Brocka',
      conferment_year: 1997,
      notable_films: ['Maynila sa mga Kuko ng Liwanag', 'Insiang', 'Tinimbang Ka Ngunit Kulang'],
    },
    {
      id: 'na-2',
      name: 'Ishmael Bernal',
      conferment_year: 2001,
      notable_films: ['Himala', 'City After Dark', 'Relasyon'],
    },
    {
      id: 'na-3',
      name: 'Kidlat Tahimik',
      conferment_year: 2018,
      notable_films: ['Mababangong Bangungot (Perfumed Nightmare)', 'Turumba'],
    },
  ],
  genres: [
    'Social Realism',
    'Historical Drama',
    'Regional Cinema',
    'Heritage / Restored',
    'Experimental / Avant-Garde',
    'Psychological Thriller',
    'Coming of Age',
  ],
};

export async function fetchExploreData(): Promise<ExploreData> {
  try {
    const { data: festData } = await supabase.from('festivals').select('*').limit(5);
    if (!festData || festData.length === 0) {
      return SAMPLE_EXPLORE_DATA;
    }
    return SAMPLE_EXPLORE_DATA;
  } catch (err) {
    return SAMPLE_EXPLORE_DATA;
  }
}

