import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, RefreshCw, User, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

const RANDOM_ADJECTIVES = ['Swift', 'Blue', 'Happy', 'Clever', 'Brave', 'Calm', 'Bright', 'Neon', 'Cyber', 'Pixel'];
const RANDOM_NOUNS = ['Fox', 'Eagle', 'Panda', 'Tiger', 'Star', 'Moon', 'Comet', 'Ninja', 'Wizard', 'Robot'];

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { profile, setProfile } = useAuth();
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id || null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Load avatars from Firestore
    const [avatars, setAvatars] = useState<any[]>([]);

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const avatarsSnap = await getDocs(collection(db, 'avatars'));
                const avatarsList = avatarsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAvatars(avatarsList);
            } catch (e) {
                console.error('Error fetching avatars:', e);
            }
        };
        fetchAvatars();
    }, []);

    const updateProfile = useMutation({
        mutationFn: async () => {
            if (!profile?.id) throw new Error('No user profile found');

            const updates = {
                display_name: displayName,
                avatar_id: selectedAvatar,
                updated_at: serverTimestamp(),
            };

            const userRef = doc(db, 'profiles', profile.id);
            await updateDoc(userRef, updates);

            // Update local context
            if (setProfile) {
                setProfile({ ...profile, ...updates });
            }

            return { success: true };
        },
        onSuccess: () => {
            toast({ title: 'Profile updated successfully' });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            onOpenChange(false);
        },
        onError: (error: any) => {
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

                // Check if username exists in Firestore
                const q = query(collection(db, 'profiles'), where('display_name', '==', username));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
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

    // Check if avatar is unlocked
    const isAvatarUnlocked = (avatar: any) => {
        if (!avatar.unlock_condition || avatar.unlock_condition.type === 'none') return true;

        const type = avatar.unlock_condition.type;
        const value = parseInt(avatar.unlock_condition.value) || 0;

        // Mock stats - in real app would come from profile
        const userQuestions = (profile?.score || 0) / 10; // Approx 10 pts per question
        const userStreak = profile?.login_streak || 1;
        const userCompetitions = profile?.competitions_attended || 0;

        if (type === 'questions') return userQuestions >= value;
        if (type === 'streak') return userStreak >= value;
        if (type === 'competitions') return userCompetitions >= value;

        return true;
    };

    const getUnlockMessage = (avatar: any) => {
        if (!avatar.unlock_condition) return '';
        const { type, value } = avatar.unlock_condition;
        if (type === 'questions') return `Answer ${value} questions to unlock`;
        if (type === 'streak') return `Log in for ${value} days in a row to unlock`;
        if (type === 'competitions') return `Participate in ${value} competitions to unlock`;
        return '';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-0 shrink-0">
                    <DialogTitle className="text-2xl font-display font-bold">Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal information and settings.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto p-6 pt-2">
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
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
                            </div>

                            <div className="space-y-4">
                                <Label>Profile Picture</Label>
                                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-xl">
                                    {avatars?.map((avatar) => (
                                        <TooltipProvider key={avatar.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => isAvatarUnlocked(avatar) && setSelectedAvatar(avatar.id)}
                                                        disabled={!isAvatarUnlocked(avatar)}
                                                        className={`relative p-1 rounded-lg transition-all 
                                                            ${selectedAvatar === avatar.id ? 'ring-2 ring-primary bg-primary/10 font-bold' : ''} 
                                                            ${!isAvatarUnlocked(avatar) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-muted'}`}
                                                    >
                                                        <img src={avatar.image_url} alt={avatar.name} className="w-10 h-10 mx-auto rounded-full object-cover" />
                                                        {!isAvatarUnlocked(avatar) && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-lg">
                                                                <Lock className="w-4 h-4 text-muted-foreground drop-shadow-md" />
                                                            </div>
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {isAvatarUnlocked(avatar) ? (
                                                        <p>{avatar.name}</p>
                                                    ) : (
                                                        <p>{getUnlockMessage(avatar)}</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
                    </div>
                </ScrollArea>

                <div className="p-6 pt-2 border-t flex justify-end">
                    <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                        {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}