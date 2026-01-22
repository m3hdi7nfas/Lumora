// ... (keep all existing imports and code until line 946)

                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={user.id === profile?.id || (user.role === 'admin' && profile?.role !== 'admin')}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            {profile?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                          </SelectContent>
                        </Select>

// ... (keep all remaining code)