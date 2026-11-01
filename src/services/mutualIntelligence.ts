import { getDatabase } from '../lib/db';
import { InstagramIntelligenceService } from './instagramIntelligence';
import fs from 'node:fs';
import path from 'node:path';

export interface MutualItem {
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  is_mutual_following?: boolean;
  is_mutual_follower?: boolean;
  connection_type?: string;
  label?: string;
  profile_link: string;
  instagram_link: string;
}

export class MutualIntelligenceService {
  private intelService = new InstagramIntelligenceService();

  private getStorageCacheDir(): string {
    const isVercel = Boolean(process.env.VERCEL);
    const dir = isVercel ? '/tmp/storage/cache' : path.resolve(process.cwd(), 'storage/cache');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  sanitizeUsername(raw: string): string {
    return raw.replace(/^@|^https?:\/\/(www\.)?instagram\.com\//, '')
      .replace(/\/$/, '')
      .replace(/[^a-zA-Z0-9._]/g, '')
      .toLowerCase()
      .trim();
  }

  async findMutualConnections(
    userA: string,
    userB: string,
    forceFresh = false,
    customLists?: {
      user1_following?: string[] | string;
      user1_followers?: string[] | string;
      user2_following?: string[] | string;
      user2_followers?: string[] | string;
    }
  ): Promise<any> {
    const cleanA = this.sanitizeUsername(userA);
    const cleanB = this.sanitizeUsername(userB);

    if (!cleanA || !cleanB) {
      throw new Error('Both Instagram usernames are required.');
    }
    if (cleanA === cleanB) {
      throw new Error('Please provide two different Instagram usernames to compare mutual connections.');
    }

    if (customLists) {
      const parseTargets = (input?: string[] | string): string[] => {
        if (!input) return [];
        if (Array.isArray(input)) return input.map((s) => this.sanitizeUsername(s)).filter(Boolean);
        return String(input)
          .split(/[\r\n,;\s]+/)
          .map((s) => this.sanitizeUsername(s))
          .filter(Boolean);
      };

      const u1Following = parseTargets(customLists.user1_following);
      const u1Followers = parseTargets(customLists.user1_followers);
      const u2Following = parseTargets(customLists.user2_following);
      const u2Followers = parseTargets(customLists.user2_followers);

      if (u1Following.length > 0) {
        this.importConnections(cleanA, 'following', u1Following);
        forceFresh = true;
      }
      if (u1Followers.length > 0) {
        this.importConnections(cleanA, 'follower', u1Followers);
        forceFresh = true;
      }
      if (u2Following.length > 0) {
        this.importConnections(cleanB, 'following', u2Following);
        forceFresh = true;
      }
      if (u2Followers.length > 0) {
        this.importConnections(cleanB, 'follower', u2Followers);
        forceFresh = true;
      }
    }

    const cacheDir = this.getStorageCacheDir();
    const cacheKey = `mutuals_${Buffer.from(cleanA + '_' + cleanB).toString('hex').slice(0, 32)}`;
    const cacheFile = path.join(cacheDir, `${cacheKey}.json`);

    if (!forceFresh && fs.existsSync(cacheFile)) {
      try {
        const stats = fs.statSync(cacheFile);
        if (Date.now() - stats.mtimeMs < 3600000) {
          const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          if (cached?.success) return cached;
        }
      } catch {}
    }

    const profileA = await this.getProfileData(cleanA);
    const profileB = await this.getProfileData(cleanB);

    const realMediaA = await this.intelService.fetchRealInstagramMedia(cleanA);
    const realMediaB = await this.intelService.fetchRealInstagramMedia(cleanB);

    const mentionsA = this.extractCaptionMentions(realMediaA, cleanA);
    const mentionsB = this.extractCaptionMentions(realMediaB, cleanB);

    const userATaggedB = Boolean(mentionsA[cleanB] || (profileA.bio && profileA.bio.toLowerCase().includes(`@${cleanB}`)));
    const userBTaggedA = Boolean(mentionsB[cleanA] || (profileB.bio && profileB.bio.toLowerCase().includes(`@${cleanA}`)));

    const db = getDatabase();
    let dbAFollowsB = false;
    let dbBFollowsA = false;

    try {
      const row1 = db.prepare("SELECT 1 FROM profile_connections WHERE account_username = ? AND connection_type = 'following' AND target_username = ?").get(cleanA, cleanB);
      dbAFollowsB = Boolean(row1);
      if (!dbAFollowsB) {
        const row1rev = db.prepare("SELECT 1 FROM profile_connections WHERE account_username = ? AND connection_type = 'follower' AND target_username = ?").get(cleanB, cleanA);
        dbAFollowsB = Boolean(row1rev);
      }

      const row2 = db.prepare("SELECT 1 FROM profile_connections WHERE account_username = ? AND connection_type = 'following' AND target_username = ?").get(cleanB, cleanA);
      dbBFollowsA = Boolean(row2);
      if (!dbBFollowsA) {
        const row2rev = db.prepare("SELECT 1 FROM profile_connections WHERE account_username = ? AND connection_type = 'follower' AND target_username = ?").get(cleanA, cleanB);
        dbBFollowsA = Boolean(row2rev);
      }
    } catch {}

    const userAFollowsB = dbAFollowsB || userATaggedB;
    const userBFollowsA = dbBFollowsA || userBTaggedA;
    const isMutualFollow = userAFollowsB && userBFollowsA;

    const verifiedCollaborators: Record<string, MutualItem> = {};
    Object.keys(mentionsA).forEach((sm) => {
      if (mentionsB[sm] && sm !== cleanA && sm !== cleanB) {
        verifiedCollaborators[sm] = {
          username: sm,
          full_name: sm.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sm}`,
          is_verified: false,
          is_mutual_following: true,
          is_mutual_follower: true,
          connection_type: 'dual_mutual',
          label: '⭐ Verified Shared Collaborator (Tagged by Both)',
          profile_link: `/report/${sm}`,
          instagram_link: `https://www.instagram.com/${sm}/`,
        };
      }
    });

    const networkA = this.getAuthenticRealNetwork(profileA, mentionsA);
    const networkB = this.getAuthenticRealNetwork(profileB, mentionsB);

    const followingMapB = new Map(networkB.following.map((i) => [i.username, i]));
    const mutualFollowing: Record<string, MutualItem> = {};
    networkA.following.forEach((item) => {
      const u = item.username;
      if (followingMapB.has(u) && u !== cleanA && u !== cleanB) {
        mutualFollowing[u] = {
          ...item,
          is_mutual_following: true,
          is_mutual_follower: false,
          connection_type: 'mutual_following',
          label: 'Both Follow',
        };
      }
    });

    const followersMapB = new Map(networkB.followers.map((i) => [i.username, i]));
    const mutualFollowers: Record<string, MutualItem> = {};
    networkA.followers.forEach((item) => {
      const u = item.username;
      if (followersMapB.has(u) && u !== cleanA && u !== cleanB) {
        mutualFollowers[u] = {
          ...item,
          is_mutual_following: false,
          is_mutual_follower: true,
          connection_type: 'mutual_follower',
          label: 'Follows Both',
        };
      }
    });

    const allMutualsMap: Record<string, MutualItem> = { ...verifiedCollaborators };
    Object.keys(mutualFollowing).forEach((u) => {
      if (!allMutualsMap[u]) {
        allMutualsMap[u] = mutualFollowing[u];
      }
    });
    Object.keys(mutualFollowers).forEach((u) => {
      if (allMutualsMap[u]) {
        allMutualsMap[u].is_mutual_follower = true;
        allMutualsMap[u].connection_type = 'dual_mutual';
        allMutualsMap[u].label = 'Dual Connection (Follows Both & Both Follow)';
      } else {
        allMutualsMap[u] = mutualFollowers[u];
      }
    });

    const allMutuals = Object.values(allMutualsMap);
    const mutualFollowingList = Object.values(mutualFollowing);
    const mutualFollowersList = Object.values(mutualFollowers);

    const totalUniqueMutuals = allMutuals.length;
    const verifiedCount = allMutuals.filter((m) => m.is_verified).length;

    let affinityScore = 0.0;
    let intimacyTier = 'No Shared Connections';
    let intimacyColor = '#6B7280';
    let relationshipStatus = 'No Mutual Connections Detected';

    if (totalUniqueMutuals > 0 || userAFollowsB || userBFollowsA) {
      let baseAffinity = Math.min(68.0, totalUniqueMutuals * 6.5);
      if (isMutualFollow) baseAffinity += 32.0;
      else if (userAFollowsB || userBFollowsA) baseAffinity += 16.0;
      baseAffinity += Object.keys(verifiedCollaborators).length * 8.0;

      affinityScore = +(Math.min(99.4, Math.max(5.0, baseAffinity))).toFixed(1);

      if (affinityScore >= 75) {
        intimacyTier = 'High Affinity & Inner Circle';
        intimacyColor = '#10B981';
      } else if (affinityScore >= 45) {
        intimacyTier = 'Strong Shared Network';
        intimacyColor = '#00F0FF';
      } else if (affinityScore >= 20) {
        intimacyTier = 'Moderate Connection Overlap';
        intimacyColor = '#725CFF';
      } else {
        intimacyTier = 'Casual / Broad Overlap';
        intimacyColor = '#F59E0B';
      }

      if (isMutualFollow) {
        relationshipStatus = 'Mutual Direct Connection (Both Follow Each Other)';
      } else if (userAFollowsB) {
        relationshipStatus = `@${cleanA} follows @${cleanB}`;
      } else if (userBFollowsA) {
        relationshipStatus = `@${cleanB} follows @${cleanA}`;
      } else if (totalUniqueMutuals >= 10) {
        relationshipStatus = 'Shared Social Circle (Strong Mutual Overlap)';
      } else if (totalUniqueMutuals >= 5) {
        relationshipStatus = 'Shared Community & Friend Network';
      } else {
        relationshipStatus = `Connected via ${totalUniqueMutuals} Mutual Connection${totalUniqueMutuals > 1 ? 's' : ''}`;
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      profile1: profileA,
      profile2: profileB,
      relationship: {
        user1_follows_user2: userAFollowsB,
        user2_follows_user1: userBFollowsA,
        is_mutual_follow: isMutualFollow,
        status_label: relationshipStatus,
      },
      metrics: {
        mutual_following_count: mutualFollowingList.length,
        mutual_followers_count: mutualFollowersList.length,
        total_unique_mutuals: totalUniqueMutuals,
        verified_collaborators_count: Object.keys(verifiedCollaborators).length,
        verified_mutuals_count: verifiedCount,
        affinity_score: affinityScore,
        intimacy_tier: intimacyTier,
        intimacy_color: intimacyColor,
        profile1_following_size: networkA.following.length,
        profile1_followers_size: networkA.followers.length,
        profile2_following_size: networkB.following.length,
        profile2_followers_size: networkB.followers.length,
      },
      verified_collaborators: Object.values(verifiedCollaborators),
      mutual_following: mutualFollowingList,
      mutual_followers: mutualFollowersList,
      all_mutuals: allMutuals,
    };

    try {
      fs.writeFileSync(cacheFile, JSON.stringify(result), 'utf8');
    } catch {}

    return result;
  }

  private extractCaptionMentions(items: any[] | null, selfUsername: string): Record<string, number> {
    const mentions: Record<string, number> = {};
    if (!items) return mentions;

    items.forEach((item) => {
      let caption = '';
      if (typeof item.caption === 'string') caption = item.caption;
      else if (item.caption?.text) caption = String(item.caption.text);

      if (caption) {
        const matches = caption.matchAll(/@([a-zA-Z0-9._]{2,30})/g);
        for (const m of matches) {
          const u = m[1].toLowerCase().replace(/\.$/, '');
          if (u !== selfUsername && !['instagram', 'reels', 'explore'].includes(u)) {
            mentions[u] = (mentions[u] || 0) + 1;
          }
        }
      }
    });

    return mentions;
  }

  async getProfileData(username: string): Promise<any> {
    const db = getDatabase();
    try {
      const cached = db.prepare('SELECT * FROM tracked_accounts WHERE username = ?').get(username) as any;
      if (cached) {
        return {
          username: cached.username,
          full_name: cached.full_name,
          avatar_url: cached.avatar_url,
          followers_count: Number(cached.followers_count),
          following_count: Number(cached.following_count),
          posts_count: Number(cached.posts_count),
          is_verified: Boolean(cached.is_verified),
          is_private: Boolean(cached.is_private),
          bio: cached.bio || '',
        };
      }
    } catch {}

    const real = await this.intelService.fetchRealInstagramProfile(username);
    if (real && real.username) {
      return {
        username: real.username,
        full_name: real.full_name,
        avatar_url: real.avatar_url,
        followers_count: real.followers_count,
        following_count: real.following_count,
        posts_count: real.posts_count,
        is_verified: Boolean(real.is_verified),
        is_private: Boolean(real.is_private),
        bio: real.bio || '',
      };
    }

    return {
      username,
      full_name: username.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      is_verified: false,
      is_private: false,
      bio: `@${username} on Instagram`,
    };
  }

  getAuthenticRealNetwork(profile: any, realMentions: Record<string, number> = {}): { following: MutualItem[]; followers: MutualItem[] } {
    const username = profile.username;
    const db = getDatabase();
    const dbFollowing: Record<string, MutualItem> = {};
    const dbFollowers: Record<string, MutualItem> = {};

    try {
      const conns = db.prepare('SELECT connection_type, target_username, target_name, target_avatar, is_verified FROM profile_connections WHERE account_username = ?').all(username) as any[];
      conns.forEach((c) => {
        const targetU = String(c.target_username || '').toLowerCase().trim();
        if (!targetU || targetU === username) return;

        const item: MutualItem = {
          username: targetU,
          full_name: c.target_name || targetU.replace(/[._]/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
          avatar_url: c.target_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetU}`,
          is_verified: Boolean(c.is_verified),
          profile_link: `/report/${targetU}`,
          instagram_link: `https://www.instagram.com/${targetU}/`,
        };

        if (c.connection_type === 'following') {
          dbFollowing[targetU] = item;
        } else {
          dbFollowers[targetU] = item;
        }
      });
    } catch {}

    Object.keys(realMentions).forEach((mU) => {
      if (mU !== username && !['instagram', 'reels', 'explore'].includes(mU)) {
        if (!dbFollowing[mU]) {
          dbFollowing[mU] = {
            username: mU,
            full_name: mU.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mU}`,
            is_verified: false,
            profile_link: `/report/${mU}`,
            instagram_link: `https://www.instagram.com/${mU}/`,
          };
        }
      }
    });

    return {
      following: Object.values(dbFollowing),
      followers: Object.values(dbFollowers),
    };
  }

  importConnections(accountUsername: string, connectionType: string, targets: string[]): number {
    const cleanAccount = this.sanitizeUsername(accountUsername);
    const type = connectionType.startsWith('follower') ? 'follower' : 'following';
    if (!cleanAccount || targets.length === 0) return 0;

    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO profile_connections (account_username, connection_type, target_username, target_name, target_avatar, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    targets.forEach((t) => {
      const cleanTarget = this.sanitizeUsername(t);
      if (!cleanTarget || cleanTarget === cleanAccount) return;

      const name = cleanTarget.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanTarget}`;
      const isVerified = ['cristiano', 'leomessi', 'nike', 'apple', 'instagram'].includes(cleanTarget) ? 1 : 0;

      stmt.run(cleanAccount, type, cleanTarget, name, avatar, isVerified);
      count++;
    });

    return count;
  }

  getStoredConnections(username: string): any {
    const clean = this.sanitizeUsername(username);
    const db = getDatabase();
    const rows = db.prepare('SELECT connection_type, target_username, target_name, target_avatar, is_verified FROM profile_connections WHERE account_username = ? ORDER BY id DESC').all(clean) as any[];

    const following: any[] = [];
    const followers: any[] = [];

    rows.forEach((r) => {
      const item = {
        username: r.target_username,
        full_name: r.target_name || r.target_username,
        avatar_url: r.target_avatar,
        is_verified: Boolean(r.is_verified),
      };
      if (r.connection_type === 'following') following.push(item);
      else followers.push(item);
    });

    return {
      username: clean,
      following_count: following.length,
      followers_count: followers.length,
      following,
      followers,
    };
  }

  exportToCsv(data: any): string {
    const p1 = data.profile1?.username || 'UserA';
    const p2 = data.profile2?.username || 'UserB';

    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const lines = [
      `${escape('Mutual Connections Report')},${escape(`@${p1} vs @${p2}`)}`,
      `${escape('Generated Date')},${escape(new Date().toISOString())}`,
      `${escape('Relationship Status')},${escape(data.relationship?.status_label || 'N/A')}`,
      `${escape('Affinity Score')},${escape(`${data.metrics?.affinity_score || 0}%`)}`,
      `${escape('Total Mutual Connections')},${escape(data.metrics?.total_unique_mutuals || 0)}`,
      '',
      ['Username', 'Full Name', 'Connection Type', 'Verified', 'Instagram URL', 'Profile Report URL'].map(escape).join(','),
    ];

    (data.all_mutuals || []).forEach((m: any) => {
      lines.push([
        `@${m.username}`,
        m.full_name,
        m.label || m.connection_type || 'Mutual Connection',
        m.is_verified ? 'YES' : 'NO',
        m.instagram_link || `https://www.instagram.com/${m.username}/`,
        `/report/${m.username}`,
      ].map(escape).join(','));
    });

    return lines.join('\r\n');
  }
}

