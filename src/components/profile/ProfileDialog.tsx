import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, RefreshCw, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const RANDOM_ADJECTIVES = ['Swift', 'Blue', 'Happy', 'Clever', 'Brave', 'Calm', 'Bright', 'Neon', 'Cyber', 'Pixel'];
const RANDOM_NOUNS = ['Fox', 'Eagle', 'Panda', 'Tiger', 'Star', 'Moon', 'Comet', 'Ninja', 'Wizard', 'Robot'];

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { profile } = useAuth();
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id || null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: avatars } = useQuery({
        queryKey: ['avatars'],
        queryFn: async () => {
            const { data, error } = await supabase.from('avatars').select('*');
            if (error) throw error;
            return data;
        },
    });

    const updateProfile = useMutation({
        mutationFn: async () => {
            const updates: any = {
                id: profile?.id,
                display_name: displayName,
                avatar_id: selectedAvatar,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Profile updated successfully' });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            onOpenChange(false);
        },
        onError: (error) => {
            toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
        },
    });

    const generateUsername = useMutation({
        mutationFn: async () => {
            let username = '';
            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 10) {
                const adj = RANDOM_ADJECTIVES[Math.floor(Math.random() * RANDOM_ADJECTIVES.length)];
                const noun = RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
                const num = Math.floor(Math.random() * 1000);
                username = `${adj}-${noun}${num}`;

                // Check if username exists
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('display_name', username)
                    .single();

                if (error || !data) {
                    isUnique = true;
                }
                attempts++;
            }

            if (!isUnique) throw new Error('Could not generate unique username');
            return username;
        },
        onSuccess: (username) => {
            setDisplayName(username);
            toast({ title: 'Username generated!', description: username });
        },
        onError: () => {
            toast({ title: 'Error generating username', variant: 'destructive' });
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal information and settings.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile?.email} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                        <Label>Username</Label>
                        <div className="flex gap-2">
                            <Input value={displayName || 'No username set'} disabled className="bg-muted" />
                            <Button variant="outline" onClick={() => generateUsername.mutate()} disabled={generateUsername.isPending} title="Generate Random Username">
                                {generateUsername.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Click the button to generate a unique username</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value="demo1234" // Mock password since we can't retrieve real one for security
                                disabled
                                className="bg-muted pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Password cannot be changed from profile</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                            {avatars?.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    className={`relative p-1 rounded-lg transition-all ${selectedAvatar === avatar.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
                                >
                                    <img src={avatar.image_url} alt={avatar.name} className="w-10 h-10 mx-auto rounded-full object-cover" />
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedAvatar(null)}
                                className={`p-1 rounded-lg transition-all flex items-center justify-center ${!selectedAvatar ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                        {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}