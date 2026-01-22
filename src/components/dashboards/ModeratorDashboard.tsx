// ... (keep existing imports)

function SchoolsTab() {
  // ... (keep existing state)
  const [newSchool, setNewSchool] = useState({
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
    created_at: '',
    updated_at: ''
  });

  // ... (keep existing code)

  const handleAddSchool = async () => {
    // Validate required fields
    if (!newSchool.name) {
      toast({ title: 'School name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Generate ID
      const newId = `school-${Date.now()}`;
      const schoolToAdd = {
        ...newSchool,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create pending approval for school
      const approvalItem = {
        id: `approval-${Date.now()}`,
        type: 'school',
        data: schoolToAdd,
        created_by: profile?.id,
        created_by_name: profile?.display_name || profile?.email,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to approvals
      localStorageCRUD.add(LOCAL_STORAGE_KEYS.APPROVALS, approvalItem);
      setSchools(localStorageCRUD.get(LOCAL_STORAGE_KEYS.SCHOOLS));

      toast({ title: 'School submitted for admin approval!', description: 'An admin will review this shortly.' });
      setIsAddDialogOpen(false);
      setNewSchool({
        id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
        created_at: '',
        updated_at: ''
      });
    } catch (error) {
      toast({ title: 'Error submitting school', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  // ... (keep rest of the code)
}

// ... (keep other functions until UsersTab)

function UsersTab() {
  // ... (keep existing state)
  const [newUser, setNewUser] = useState({
    id: '',
    email: '',
    display_name: '',
    role: 'student',
    school_id: '',
    password: '',
    is_active: true,
    score: 0,
    progress: 0,
    avatar_id: null,
    created_at: '',
    updated_at: ''
  });

  // ... (keep existing code)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      // Find the user and update their role
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;

      const updatedUser = {
        ...userToUpdate,
        role: newRole,
        updated_at: new Date().toISOString()
      };

      // Update in local storage
      localStorageCRUD.update(LOCAL_STORAGE_KEYS.USERS, userId, updatedUser);
      setUsers(localStorageCRUD.get(LOCAL_STORAGE_KEYS.USERS));

      toast({ title: 'User role updated successfully!' });
    } catch (error) {
      toast({ title: 'Error updating user role', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  // ... (keep rest of the code)
}

// ... (keep rest of the file)