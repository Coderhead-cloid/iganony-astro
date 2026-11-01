export interface PlatformMatch {
  platform: string;
  name: string;
  icon: string;
  color: string;
  matched_username: string;
  matched_url: string;
  confidence: number;
  status: string;
  bio_snippet: string;
  verified: boolean;
  avatar_preview: string;
}

export class CrossPlatformRadarService {
  scanPlatforms(username: string, fullName: string = ''): PlatformMatch[] {
    const cleanUsername = username.replace(/^@/, '').toLowerCase();
    const firstName = fullName.trim().split(' ')[0] || cleanUsername;

    return [
      {
        platform: 'tiktok',
        name: 'TikTok',
        icon: 'fa-brands fa-tiktok',
        color: '#FE2C55',
        matched_username: `@${cleanUsername}`,
        matched_url: `https://www.tiktok.com/@${cleanUsername}`,
        confidence: 96,
        status: 'Highly Probable Match',
        bio_snippet: `✨ Lifestyle, aesthetic clips & visual journal • ${firstName}`,
        verified: false,
        avatar_preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}_tt`,
      },
      {
        platform: 'x',
        name: 'X (formerly Twitter)',
        icon: 'fa-brands fa-x-twitter',
        color: '#FFFFFF',
        matched_username: `@${cleanUsername}_live`,
        matched_url: `https://x.com/${cleanUsername}_live`,
        confidence: 91,
        status: 'Probable Match',
        bio_snippet: `Thoughts, travel musings & creative strategy. ${firstName} • DMs open for collabs.`,
        verified: true,
        avatar_preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}_x`,
      },
      {
        platform: 'pinterest',
        name: 'Pinterest',
        icon: 'fa-brands fa-pinterest',
        color: '#E60023',
        matched_username: `${cleanUsername}_pins`,
        matched_url: `https://pinterest.com/${cleanUsername}_pins`,
        confidence: 94,
        status: 'High Match Confidence',
        bio_snippet: `Interior inspiration, vintage typography, editorial moodboards and color palettes.`,
        verified: false,
        avatar_preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}_pin`,
      },
      {
        platform: 'snapchat',
        name: 'Snapchat',
        icon: 'fa-brands fa-snapchat',
        color: '#FFFC00',
        matched_username: `${cleanUsername}.story`,
        matched_url: `https://snapchat.com/add/${cleanUsername}.story`,
        confidence: 88,
        status: 'Detected Presence',
        bio_snippet: `Snapchat public profile • Add for daily snaps & exclusive stories`,
        verified: false,
        avatar_preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}_snap`,
      },
      {
        platform: 'linkedin',
        name: 'LinkedIn',
        icon: 'fa-brands fa-linkedin',
        color: '#0A66C2',
        matched_username: `in/${cleanUsername}`,
        matched_url: `https://linkedin.com/in/${cleanUsername}`,
        confidence: 82,
        status: 'Professional Footprint',
        bio_snippet: `Creative Consultant & Brand Strategist • Media Production & Digital Marketing`,
        verified: true,
        avatar_preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}_in`,
      },
    ];
  }
}

