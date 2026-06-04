export const ONBOARDING_KEY = 'athena_onboarding_complete'
export const MEDITATIONS_COVER = 'https://covers.openlibrary.org/b/id/8325994-L.jpg'

export const SLIDES = [
  {
    id: '1',
    image: require('../../../assets/images/slide-1.png'),
    headline: 'You want to\nread more.',
    body: 'But life gets in the way. Commutes, chores, workouts... time that could be pages.',
  },
  {
    id: '2',
    image: require('../../../assets/images/slide-2.png'),
    headline: 'Your voice.\nYour books.',
    body: 'Record 60 seconds of yourself. Athena clones your voice and reads any book back to you.',
  },
  {
    id: '3',
    image: null,
    headline: null,
    body: 'Yours will sound like you.',
  },
]

export type SlideType = typeof SLIDES[0]