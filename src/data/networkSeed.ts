export interface StoredConnection {
  account_username: string;
  connection_type: 'following' | 'follower';
  target_username: string;
  target_name: string;
  target_avatar: string;
  is_verified: boolean;
}

export const VERIFIED_NETWORK_SEEDS: StoredConnection[] = [
  // ==========================================
  // CLUSTER 1: GSWebIT & Indian Tech Creators
  // ==========================================
  // gswebit
  {
    account_username: 'gswebit',
    connection_type: 'following',
    target_username: 'gaurav_rathi83',
    target_name: 'Gourav Rathi',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/5d033956-0f59-4bd5-8d11-c9992ddde765.jpg',
    is_verified: false,
  },
  {
    account_username: 'gswebit',
    connection_type: 'following',
    target_username: '__naman.sharma__0.1',
    target_name: 'Naman Sharma',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/abff0a8d-2224-48ff-b748-97cafddb4cae.jpg',
    is_verified: false,
  },
  {
    account_username: 'gswebit',
    connection_type: 'follower',
    target_username: 'gaurav_rathi83',
    target_name: 'Gourav Rathi',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/5d033956-0f59-4bd5-8d11-c9992ddde765.jpg',
    is_verified: false,
  },
  {
    account_username: 'gswebit',
    connection_type: 'follower',
    target_username: '__naman.sharma__0.1',
    target_name: 'Naman Sharma',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/abff0a8d-2224-48ff-b748-97cafddb4cae.jpg',
    is_verified: false,
  },

  // gaurav_rathi83
  {
    account_username: 'gaurav_rathi83',
    connection_type: 'following',
    target_username: 'gswebit',
    target_name: 'GS Web IT - Web development Solutions',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/9f5309e2-966a-4eda-b4c6-8cf5ba3fcd56.jpg',
    is_verified: false,
  },
  {
    account_username: 'gaurav_rathi83',
    connection_type: 'following',
    target_username: '__naman.sharma__0.1',
    target_name: 'Naman Sharma',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/abff0a8d-2224-48ff-b748-97cafddb4cae.jpg',
    is_verified: false,
  },
  {
    account_username: 'gaurav_rathi83',
    connection_type: 'following',
    target_username: 'i__am._.rishi',
    target_name: 'Rishi',
    target_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=i__am._.rishi',
    is_verified: false,
  },
  {
    account_username: 'gaurav_rathi83',
    connection_type: 'follower',
    target_username: 'gswebit',
    target_name: 'GS Web IT - Web development Solutions',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/9f5309e2-966a-4eda-b4c6-8cf5ba3fcd56.jpg',
    is_verified: false,
  },
  {
    account_username: 'gaurav_rathi83',
    connection_type: 'follower',
    target_username: '__naman.sharma__0.1',
    target_name: 'Naman Sharma',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/abff0a8d-2224-48ff-b748-97cafddb4cae.jpg',
    is_verified: false,
  },

  // __naman.sharma__0.1
  {
    account_username: '__naman.sharma__0.1',
    connection_type: 'following',
    target_username: 'gswebit',
    target_name: 'GS Web IT - Web development Solutions',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/9f5309e2-966a-4eda-b4c6-8cf5ba3fcd56.jpg',
    is_verified: false,
  },
  {
    account_username: '__naman.sharma__0.1',
    connection_type: 'following',
    target_username: 'gaurav_rathi83',
    target_name: 'Gourav Rathi',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/5d033956-0f59-4bd5-8d11-c9992ddde765.jpg',
    is_verified: false,
  },
  {
    account_username: '__naman.sharma__0.1',
    connection_type: 'follower',
    target_username: 'gswebit',
    target_name: 'GS Web IT - Web development Solutions',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/9f5309e2-966a-4eda-b4c6-8cf5ba3fcd56.jpg',
    is_verified: false,
  },
  {
    account_username: '__naman.sharma__0.1',
    connection_type: 'follower',
    target_username: 'gaurav_rathi83',
    target_name: 'Gourav Rathi',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/5d033956-0f59-4bd5-8d11-c9992ddde765.jpg',
    is_verified: false,
  },

  // i__am._.rishi
  {
    account_username: 'i__am._.rishi',
    connection_type: 'following',
    target_username: 'gaurav_rathi83',
    target_name: 'Gourav Rathi',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/5d033956-0f59-4bd5-8d11-c9992ddde765.jpg',
    is_verified: false,
  },
  {
    account_username: 'i__am._.rishi',
    connection_type: 'follower',
    target_username: 'gaurav_rathi83',
    target_name: 'Gourav Rathi',
    target_avatar: 'https://res-back.pumpsoul.com/ins_avatar/5d033956-0f59-4bd5-8d11-c9992ddde765.jpg',
    is_verified: false,
  },

  // ==========================================
  // CLUSTER 2: Global Football Circle
  // ==========================================
  // cristiano (Cristiano Ronaldo)
  {
    account_username: 'cristiano',
    connection_type: 'following',
    target_username: 'davidbeckham',
    target_name: 'David Beckham',
    target_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'cristiano',
    connection_type: 'following',
    target_username: 'sergioramos',
    target_name: 'Sergio Ramos',
    target_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'cristiano',
    connection_type: 'following',
    target_username: 'marcelotwelve',
    target_name: 'Marcelo Vieira',
    target_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'cristiano',
    connection_type: 'following',
    target_username: 'k.mbappe',
    target_name: 'Kylian Mbappé',
    target_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'cristiano',
    connection_type: 'following',
    target_username: 'championsleague',
    target_name: 'UEFA Champions League',
    target_avatar: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // leomessi (Leo Messi)
  {
    account_username: 'leomessi',
    connection_type: 'following',
    target_username: 'davidbeckham',
    target_name: 'David Beckham',
    target_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'leomessi',
    connection_type: 'following',
    target_username: 'sergioramos',
    target_name: 'Sergio Ramos',
    target_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'leomessi',
    connection_type: 'following',
    target_username: 'neymarjr',
    target_name: 'Neymar Jr',
    target_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'leomessi',
    connection_type: 'following',
    target_username: 'k.mbappe',
    target_name: 'Kylian Mbappé',
    target_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'leomessi',
    connection_type: 'following',
    target_username: 'championsleague',
    target_name: 'UEFA Champions League',
    target_avatar: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // neymarjr (Neymar Jr)
  {
    account_username: 'neymarjr',
    connection_type: 'following',
    target_username: 'leomessi',
    target_name: 'Leo Messi',
    target_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'neymarjr',
    connection_type: 'following',
    target_username: 'cristiano',
    target_name: 'Cristiano Ronaldo',
    target_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'neymarjr',
    connection_type: 'following',
    target_username: 'k.mbappe',
    target_name: 'Kylian Mbappé',
    target_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'neymarjr',
    connection_type: 'following',
    target_username: 'davidbeckham',
    target_name: 'David Beckham',
    target_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // davidbeckham
  {
    account_username: 'davidbeckham',
    connection_type: 'following',
    target_username: 'cristiano',
    target_name: 'Cristiano Ronaldo',
    target_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'davidbeckham',
    connection_type: 'following',
    target_username: 'leomessi',
    target_name: 'Leo Messi',
    target_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'davidbeckham',
    connection_type: 'following',
    target_username: 'neymarjr',
    target_name: 'Neymar Jr',
    target_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // sergioramos
  {
    account_username: 'sergioramos',
    connection_type: 'following',
    target_username: 'cristiano',
    target_name: 'Cristiano Ronaldo',
    target_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'sergioramos',
    connection_type: 'following',
    target_username: 'leomessi',
    target_name: 'Leo Messi',
    target_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'sergioramos',
    connection_type: 'following',
    target_username: 'k.mbappe',
    target_name: 'Kylian Mbappé',
    target_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // k.mbappe
  {
    account_username: 'k.mbappe',
    connection_type: 'following',
    target_username: 'cristiano',
    target_name: 'Cristiano Ronaldo',
    target_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'k.mbappe',
    connection_type: 'following',
    target_username: 'leomessi',
    target_name: 'Leo Messi',
    target_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // ==========================================
  // CLUSTER 3: Indian Cricket Stars Circle
  // ==========================================
  // virat.kohli
  {
    account_username: 'virat.kohli',
    connection_type: 'following',
    target_username: 'rohit_sharma',
    target_name: 'Rohit Sharma',
    target_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'virat.kohli',
    connection_type: 'following',
    target_username: 'hardikpandya93',
    target_name: 'Hardik Pandya',
    target_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'virat.kohli',
    connection_type: 'following',
    target_username: 'klrahul',
    target_name: 'KL Rahul',
    target_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'virat.kohli',
    connection_type: 'following',
    target_username: 'sachintendulkar',
    target_name: 'Sachin Tendulkar',
    target_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'virat.kohli',
    connection_type: 'following',
    target_username: 'bcci',
    target_name: 'BCCI',
    target_avatar: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // rohit_sharma
  {
    account_username: 'rohit_sharma',
    connection_type: 'following',
    target_username: 'virat.kohli',
    target_name: 'Virat Kohli',
    target_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'rohit_sharma',
    connection_type: 'following',
    target_username: 'hardikpandya93',
    target_name: 'Hardik Pandya',
    target_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'rohit_sharma',
    connection_type: 'following',
    target_username: 'klrahul',
    target_name: 'KL Rahul',
    target_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'rohit_sharma',
    connection_type: 'following',
    target_username: 'sachintendulkar',
    target_name: 'Sachin Tendulkar',
    target_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'rohit_sharma',
    connection_type: 'following',
    target_username: 'bcci',
    target_name: 'BCCI',
    target_avatar: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // hardikpandya93
  {
    account_username: 'hardikpandya93',
    connection_type: 'following',
    target_username: 'virat.kohli',
    target_name: 'Virat Kohli',
    target_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'hardikpandya93',
    connection_type: 'following',
    target_username: 'rohit_sharma',
    target_name: 'Rohit Sharma',
    target_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'hardikpandya93',
    connection_type: 'following',
    target_username: 'klrahul',
    target_name: 'KL Rahul',
    target_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // ==========================================
  // CLUSTER 4: Global Tech & Design
  // ==========================================
  // github
  {
    account_username: 'github',
    connection_type: 'following',
    target_username: 'vercel',
    target_name: 'Vercel',
    target_avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'github',
    connection_type: 'following',
    target_username: 'figma',
    target_name: 'Figma',
    target_avatar: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // vercel
  {
    account_username: 'vercel',
    connection_type: 'following',
    target_username: 'github',
    target_name: 'GitHub',
    target_avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'vercel',
    connection_type: 'following',
    target_username: 'figma',
    target_name: 'Figma',
    target_avatar: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },

  // figma
  {
    account_username: 'figma',
    connection_type: 'following',
    target_username: 'github',
    target_name: 'GitHub',
    target_avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
  {
    account_username: 'figma',
    connection_type: 'following',
    target_username: 'vercel',
    target_name: 'Vercel',
    target_avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
  },
];
