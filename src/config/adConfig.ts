export interface AdConfig {
  id: string;
  title: string;
  actionUrl: string;
  backgroundImage?: string;
  isSponsored?: boolean; // Show "Sponsored" label
  showCondition?: () => boolean; // Function to determine if this ad should show
}

export const ADS: AdConfig[] = [
  {
    id: 'donate-palestine',
    title: 'Donate for Palestinian Kids 🇵🇸',
    actionUrl: 'https://kitabisa.com/campaign/panganuntukrafah?utm_source=socialsharing_donor_web_13c629e87f4ad8719eb9fdd03f3efc1d&utm_medium=share_campaign_copas&utm_campaign=share_detail_campaign',
    backgroundImage: 'https://images.unsplash.com/photo-1715829152093-500526cf4ee1',
    isSponsored: false,
    // No showCondition - always eligible to show
  },
  {
    id: 'morning-almatsurat',
    title: 'Start Your Day with Morning Almatsurat 🌅',
    actionUrl: 'https://open.spotify.com/track/1kRFWDBUg29ZrbHl2yfJw3?si=baf962e023884fa1',
    backgroundImage: 'https://images.unsplash.com/photo-1551041777-575d3855ca71',
    isSponsored: false,
    showCondition: () => {
      const hour = new Date().getHours();
      return hour >= 4 && hour < 12; // Show from 4 AM to 12 PM
    },
  },
  {
    id: 'afternoon-almatsurat',
    title: 'End Your Day with Afternoon Almatsurat 🌆',
    actionUrl: 'https://open.spotify.com/track/4Jyna2ySg6BdL8HFJ2aFNR?si=2e4027b5da184f83',
    backgroundImage: 'https://images.unsplash.com/photo-1713239060784-e6ed820a0715',
    isSponsored: false,
    showCondition: () => {
      const hour = new Date().getHours();
      return hour >= 12 || hour < 4; // Show from 12 PM onwards and late night
    },
  },
];

/**
 * Get the current ad to display based on time and conditions
 */
export function getCurrentAd(): AdConfig | null {
  const activeAd = ADS.find(ad => !ad.showCondition || ad.showCondition());
  return activeAd || null;
}
