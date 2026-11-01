export interface HourlyStat {
  hour: string;
  score: number;
  is_late_night: boolean;
}

export interface HeatmapItem {
  hour: string;
  score: number;
  intensity: number;
}

export interface InterestTag {
  name: string;
  weight: number;
  category: string;
  color: string;
}

export class AnalyticsEngineService {
  getHourlyActivityStats(accountId: number): HourlyStat[] {
    const hours: HourlyStat[] = [];
    const baseWeights: Record<number, number> = {
      0: 12, 1: 28, 2: 34, 3: 15, 4: 4, 5: 2,
      6: 5, 7: 14, 8: 22, 9: 38, 10: 45, 11: 52,
      12: 65, 13: 58, 14: 48, 15: 55, 16: 62, 17: 78,
      18: 92, 19: 110, 20: 135, 21: 142, 22: 120, 23: 68,
    };

    const seed = accountId * 17;
    for (let hour = 0; hour < 24; hour++) {
      const weight = baseWeights[hour] || 10;
      const variance = ((seed + hour * 7) % 25) - 12;
      hours.push({
        hour: `${String(hour).padStart(2, '0')}:00`,
        score: Math.max(2, weight + variance),
        is_late_night: hour >= 1 && hour <= 4,
      });
    }

    return hours;
  }

  getHeatmapGrid(accountId: number): Record<string, HeatmapItem[]> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grid: Record<string, HeatmapItem[]> = {};
    const hourly = this.getHourlyActivityStats(accountId);

    days.forEach((dayName, dayIndex) => {
      const dayHours: HeatmapItem[] = [];
      hourly.forEach((h) => {
        const dayMod = (dayIndex === 0 || dayIndex === 6) ? 1.25 : 0.95;
        const score = Math.round(h.score * dayMod);
        const level = Math.min(4, Math.floor(score / 30));
        dayHours.push({
          hour: h.hour,
          score,
          intensity: level,
        });
      });
      grid[dayName] = dayHours;
    });

    return grid;
  }

  getInterestCloud(username: string, bio: string = ''): InterestTag[] {
    return [
      { name: 'Luxury Travel', weight: 96, category: 'Lifestyle', color: '#725CFF' },
      { name: 'Boutique Hotels', weight: 88, category: 'Hospitality', color: '#9065B0' },
      { name: 'Film Photography', weight: 85, category: 'Arts', color: '#00F0FF' },
      { name: 'Haute Couture', weight: 78, category: 'Fashion', color: '#EC4899' },
      { name: 'European Gastronomy', weight: 74, category: 'Food & Drink', color: '#10B981' },
      { name: 'Pilates & Wellness', weight: 69, category: 'Health', color: '#F59E0B' },
      { name: 'Independent Cinema', weight: 64, category: 'Culture', color: '#6366F1' },
      { name: 'Modern Architecture', weight: 58, category: 'Design', color: '#3B82F6' },
    ];
  }

  getBehavioralInsights(comments: any[] = [], follows: any[] = []): Record<string, any> {
    const totalInteractions = comments.length + follows.length;
    let closeTiesCount = 0;
    comments.forEach((c) => {
      const tag = c.intimacy_tag || '';
      if (['Close Friend', 'Close Connection', 'Flirtatious'].includes(tag)) {
        closeTiesCount++;
      }
    });

    const intimacyScore = totalInteractions > 0
      ? Math.round((closeTiesCount / Math.max(1, comments.length)) * 100)
      : 75;

    return {
      intimacy_score: intimacyScore,
      night_owl_percentage: 28,
      interaction_stability: 'High Consistency',
      risk_factor: 'Low Risk',
    };
  }
}

