// Initialize local storage with default data if not present
export function initializeLocalStorage() {
  const LOCAL_STORAGE_KEYS = {
    USERS: 'lumora_users',
    COMPETITIONS: 'lumora_competitions',
    QUESTIONS: 'lumora_questions',
    SCHOOLS: 'lumora_schools',
    APPROVALS: 'lumora_approvals',
    MESSAGES: 'lumora_messages',
    AVATARS: 'lumora_avatars',
    BADGES: 'lumora_badges',
    SETTINGS: 'lumora_settings'
  };

  // Check and initialize each storage key
  Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });

  // Add some default avatars if none exist
  const avatars = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.AVATARS) || '[]');
  if (avatars.length === 0) {
    const defaultAvatars = [
      {
        id: 'avatar-1',
        name: 'Default Avatar',
        image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=default',
        category: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'avatar-2',
        name: 'Student',
        image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=student',
        category: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'avatar-3',
        name: 'Teacher',
        image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=teacher',
        category: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.AVATARS, JSON.stringify(defaultAvatars));
  }

  // Add some default badges if none exist
  const badges = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.BADGES) || '[]');
  if (badges.length === 0) {
    const defaultBadges = [
      {
        id: 'badge-1',
        name: 'First Login',
        description: 'Completed first login',
        image_url: '',
        category: 'achievement',
        points_required: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'badge-2',
        name: 'Math Master',
        description: 'Answered 50 math questions correctly',
        image_url: '',
        category: 'skill',
        points_required: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.BADGES, JSON.stringify(defaultBadges));
  }

  // Set default settings if not present
  if (!localStorage.getItem('showAds')) {
    localStorage.setItem('showAds', 'true');
  }
}