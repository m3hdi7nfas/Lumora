// In the UsersTab component, find the Select component and fix the disabled prop
<Select
  value={user.role}
  onValueChange={(value) => handleRoleChange(user.id, value)}
  disabled={user.id === profile?.id || (user.role === 'admin' && profile?.role !== 'admin')}
>