// Update the avatar initialization section
// Add some default avatars if none exist
const avatars = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.AVATARS) || '[]');
if (avatars.length === 0) {
  const defaultAvatars = [
    {
      id: 'avatar-1',
      name: 'Default Avatar',
      image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=default',
      category: 'default',
      unlock_condition: 'none',
      unlock_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-2',
      name: 'Student',
      image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=student',
      category: 'default',
      unlock_condition: 'none',
      unlock_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-3',
      name: 'Teacher',
      image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=teacher',
      category: 'default',
      unlock_condition: 'none',
      unlock_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-4',
      name: 'Math Master',
      image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=math',
      category: 'achievement',
      unlock_condition: 'questions_answered',
      unlock_value: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-5',
      name: 'Login Streak',
      image_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=streak',
      category: 'achievement',
      unlock_condition: 'login_streak',
      unlock_value: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEYS.AVATARS, JSON.stringify(defaultAvatars));
}