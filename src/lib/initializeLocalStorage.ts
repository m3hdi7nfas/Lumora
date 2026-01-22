// Local storage utilities
const LOCAL_STORAGE_KEYS = {
  USERS: 'lumora_users',
  CURRENT_USER: 'lumora_current_user',
  SESSIONS: 'lumora_sessions',
  AVATARS: 'lumora_avatars',
  COMPETITIONS: 'lumora_competitions',
  QUESTIONS: 'lumora_questions',
  QUESTION_SETS: 'lumora_question_sets',
  SCHOOLS: 'lumora_schools'
};

const localStorageCRUD = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  },

  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },

  add: (key, item) => {
    const items = localStorageCRUD.get(key);
    items.push(item);
    return localStorageCRUD.set(key, items);
  },

  update: (key, id, updates) => {
    const items = localStorageCRUD.get(key);
    const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
    return localStorageCRUD.set(key, updatedItems);
  },

  remove: (key, id) => {
    const items = localStorageCRUD.get(key);
    const filteredItems = items.filter(item => item.id !== id);
    return localStorageCRUD.set(key, filteredItems);
  }
};

export function initializeLocalStorage() {
  // Initialize users if not present
  const users = localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS);
  if (users.length === 0) {
    // Add demo accounts to local storage
    const demoAccounts = [
      {
        id: 'demo-admin-id',
        user_id: 'demo-admin-user-id',
        email: 'demo.admin@lumora.com',
        role: 'admin',
        display_name: 'Demo Admin',
        avatar_url: null,
        avatar_id: null,
        school_id: null,
        score: 1000,
        class: null,
        is_active: true,
        progress: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-moderator-id',
        user_id: 'demo-moderator-user-id',
        email: 'demo.moderator@lumora.com',
        role: 'moderator',
        display_name: 'Demo Moderator',
        avatar_url: null,
        avatar_id: null,
        school_id: null,
        score: 800,
        class: null,
        is_active: true,
        progress: 80,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-teacher-id',
        user_id: 'demo-teacher-user-id',
        email: 'demo.teacher@lumora.com',
        role: 'teacher',
        display_name: 'Demo Teacher',
        avatar_url: null,
        avatar_id: null,
        school_id: null,
        score: 600,
        class: null,
        is_active: true,
        progress: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-student-id',
        user_id: 'demo-student-user-id',
        email: 'demo.student@lumora.com',
        role: 'student',
        display_name: 'Demo Student',
        avatar_url: null,
        avatar_id: null,
        school_id: null,
        score: 400,
        class: null,
        is_active: true,
        progress: 40,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(demoAccounts));
  }

  // Initialize avatars if not present
  const avatars = localStorageCRUD.get(LOCAL_STORAGE_KEYS.AVATARS);
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

  // Initialize competitions if not present
  const competitions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.COMPETITIONS);
  if (competitions.length === 0) {
    const defaultCompetitions = [
      {
        id: 'comp-1',
        name: 'Math Challenge',
        description: 'Annual math competition for all students',
        is_active: true,
        max_participants: 100,
        current_participants: 15,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'comp-2',
        name: 'Science Olympiad',
        description: 'Science competition covering physics, chemistry, and biology',
        is_active: false,
        max_participants: 50,
        current_participants: 0,
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMPETITIONS, JSON.stringify(defaultCompetitions));
  }

  // Initialize questions if not present
  const questions = localStorageCRUD.get(LOCAL_STORAGE_KEYS.QUESTIONS);
  if (questions.length === 0) {
    const defaultQuestions = [
      {
        id: 'q-1',
        text: 'What is 2 + 2?',
        category: 'Math',
        difficulty: 'easy',
        points: 10,
        options: ['2', '3', '4', '5'],
        correct_answer: '4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'q-2',
        text: 'What is the capital of France?',
        category: 'Geography',
        difficulty: 'medium',
        points: 15,
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correct_answer: 'Paris',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
  }

  // Initialize schools if not present
  const schools = localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS);
  if (schools.length === 0) {
    const defaultSchools = [
      {
        id: 'school-1',
        name: 'Central High School',
        location: 'New York, NY',
        students_count: 500,
        teachers_count: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'school-2',
        name: 'Westside Academy',
        location: 'Los Angeles, CA',
        students_count: 350,
        teachers_count: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEYS.SCHOOLS, JSON.stringify(defaultSchools));
  }

  console.log('Local storage initialized with demo data');
}