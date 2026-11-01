export interface StoredConnection {
  account_username: string;
  connection_type: 'following' | 'follower';
  target_username: string;
  target_name: string;
  target_avatar: string;
  is_verified: boolean;
}

export const VERIFIED_NETWORK_SEEDS: StoredConnection[] = [
  // gswebit network
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

  // gaurav_rathi83 network
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

  // __naman.sharma__0.1 network
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
];
