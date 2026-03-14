import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, RefreshCw, User, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const RANDOM_ADJECTIVES = ['Solar', 'Quantum', 'Nebula', 'Infinite', 'Galactic', 'Cosmic', 'Astro', 'Prism', 'Vertex', 'Omega', 'Nova', 'Flux', 'Zesty', 'Vibrant', 'Serene', 'Luminous'];
const RANDOM_NOUNS = ['Seeker', 'Voyager', 'Pioneer', 'Zenith', 'Origin', 'Element', 'Matrix', 'Vector', 'Spark', 'Flow', 'Echo', 'Sync', 'Apex', 'Core', 'Link', 'Orbit'];

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { profile, setProfile } = useAuth();
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [editEmail, setEditEmail] = useState(profile?.email || '');
    const [editPassword, setEditPassword] = useState(profile?.password_text || '');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id || null);
    const [generatedUsernames, setGeneratedUsernames] = useState<string[]>([]);
    const [genIndex, setGenIndex] = useState(0);
    const [solvedCount, setSolvedCount] = useState(0);
    const [avatarPage, setAvatarPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Load avatars from Firestore
    const [avatars, setAvatars] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!profile?.id) return;
            try {
                const lastRerollAt = (profile as any).last_reroll_at || '1970-01-01T00:00:00Z';
                const { count } = await supabase
                    .from('results')
                    .select('*', { count: 'exact', head: true })
                    .eq('student_id', profile.id)
                    .gt('submitted_at', lastRerollAt);
                setSolvedCount(count || 0);
            } catch (e) {
                console.error('Error fetching solved count:', e);
            }
        };
        fetchStats();

        const fetchAvatars = async () => {
            try {
                const { data, error } = await supabase.from('avatars').select('*');
                if (error) throw error;
                const avatarsList = (data || []).map((av: any) => ({
                    ...av,
                    image_url: av.url || av.image_url
                }));
                setAvatars(avatarsList);
            } catch (e) {
                console.error('Error fetching avatars:', e);
            }
        };
        fetchAvatars();
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: async () => {
            if (!profile?.id) throw new Error('No user profile found');

            const updates: any = {
                display_name: displayName,
                avatar_id: selectedAvatar,
                updated_at: new Date().toISOString(),
            };

            // If username changed, update the reroll timer
            if (displayName !== profile.display_name) {
                updates.last_reroll_at = new Date().toISOString();
            }

            if (profile?.role === 'admin' || profile?.role === 'moderator') {
                if (editEmail !== profile.email || editPassword !== profile.password_text) {
                    const authUpdates: any = {};
                    if (editEmail !== profile.email) authUpdates.email = editEmail;
                    if (editPassword !== profile.password_text) authUpdates.password = editPassword;
                    
                    if (Object.keys(authUpdates).length > 0) {
                        const { error: authError } = await supabase.auth.updateUser(authUpdates);
                        if (authError) throw new Error(authError.message);
                        
                        if (editEmail !== profile.email) updates.email = editEmail;
                        if (editPassword) updates.password_text = editPassword;
                    }
                }
            }

            const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
            if (error) throw error;

            // Re-fetch full profile to get new avatar_url if avatar_id changed
            const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*, avatars(url)')
                .eq('id', profile.id)
                .single();

            if (updatedProfile && setProfile) {
                const profileData = {
                    ...updatedProfile as any,
                    avatar_url: (updatedProfile as any).avatars?.url || (updatedProfile as any).avatar_url || null
                };
                setProfile(profileData);
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

    const [previousWords, setPreviousWords] = useState<Set<string>>(new Set());

    const generateUsernames = useMutation({
        mutationFn: async () => {
            const newNames: string[] = [];
            const currentGenerationWords = new Set<string>();

            while (newNames.length < 5) {
                const availableAdjectives = RANDOM_ADJECTIVES.filter(a => !previousWords.has(a));
                const availableNouns = RANDOM_NOUNS.filter(n => !previousWords.has(n));

                // Fallback to full list if we ran out of unique words (unlikely with large lists, but good for robustness)
                const adjsToUse = availableAdjectives.length > 0 ? availableAdjectives : RANDOM_ADJECTIVES;
                const nounsToUse = availableNouns.length > 0 ? availableNouns : RANDOM_NOUNS;

                const adj = adjsToUse[Math.floor(Math.random() * adjsToUse.length)];
                const noun = nounsToUse[Math.floor(Math.random() * nounsToUse.length)];
                const num = Math.floor(Math.random() * 900) + 100;
                const name = `${adj}-${noun}${num}`;

                const { data } = await supabase.from('profiles').select('id').eq('display_name', name).limit(1);
                if ((!data || data.length === 0) && !newNames.includes(name)) {
                    newNames.push(name);
                    currentGenerationWords.add(adj);
                    currentGenerationWords.add(noun);
                }
            }
            return { names: newNames, words: currentGenerationWords };
        },
        onSuccess: (result) => {
            setGeneratedUsernames(result.names);
            setPreviousWords(result.words);
            setGenIndex(0);
            setDisplayName(result.names[0]);
            toast({ title: '5 Usernames generated!', description: 'Cycle through items to pick one.' });
        },
        onError: (error: any) => {
            toast({ title: 'Cannot generate usernames', description: error.message, variant: 'destructive' });
        },
    });

    const cycleUsername = () => {
        const nextIndex = (genIndex + 1) % generatedUsernames.length;
        setGenIndex(nextIndex);
        setDisplayName(generatedUsernames[nextIndex]);
    };

    // Check if avatar is unlocked
    const isAvatarUnlocked = (avatar: any) => {
        if (!avatar.unlock_condition || avatar.unlock_condition.type === 'none') return true;

        const type = avatar.unlock_condition.type;
        const value = parseInt(avatar.unlock_condition.value) || 0;

        // Mock stats - in real app would come from profile
        const userQuestions = (profile?.score || 0) / 10; // Approx 10 pts per question
        const userStreak = (profile as any)?.login_streak || 0;
        const userCompetitions = (profile as any)?.competitions_attended || 0;

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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-0 shrink-0">
                    <DialogTitle className="text-2xl font-display font-bold">Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal information and settings.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto p-6 pt-2">
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    {(profile?.role === 'admin' || profile?.role === 'moderator') ? (
                                        <Input 
                                            value={editEmail} 
                                            onChange={(e) => setEditEmail(e.target.value)}
                                        />
                                    ) : (
                                        <Input value={profile?.email} disabled className="bg-muted" />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <div className="flex gap-2">
                                        <Input value={displayName || 'No username set'} disabled className="bg-muted" />
                                        {generatedUsernames.length > 0 ? (
                                            <Button variant="outline" onClick={cycleUsername} title="Cycle Usernames">
                                                <RefreshCw className="w-4 h-4" />
                                                <span className="ml-2 text-xs">{genIndex + 1}/5</span>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" onClick={() => generateUsernames.mutate()} disabled={generateUsernames.isPending} title="Generate 5 Random Usernames">
                                                {generateUsernames.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {profile?.display_name ? `5 Rerolls Available ` : 'Click to generate 5 unique usernames'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <div className="relative">
                                        {(profile?.role === 'admin' || profile?.role === 'moderator') ? (
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={editPassword}
                                                onChange={(e) => setEditPassword(e.target.value)}
                                                className="pr-10"
                                            />
                                        ) : (
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={showPassword ? (profile?.password_text || "Not Available") : "••••••••••••"}
                                                disabled
                                                className="bg-muted pr-10"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{(profile?.role === 'admin' || profile?.role === 'moderator') ? "Update email and password using the Save Changes button." : "Password cannot be changed from profile"}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Profile Picture</Label>
                                    {avatars.length + 1 > 9 && (
                                        <div className="flex gap-1">
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-6 w-6" 
                                                disabled={avatarPage === 0}
                                                onClick={() => {
                                                    setDirection(-1);
                                                    setAvatarPage(p => Math.max(0, p - 1));
                                                }}
                                            >
                                                <ChevronLeft className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="h-6 w-6" 
                                                disabled={(avatarPage + 1) * 9 >= avatars.length + 1}
                                                onClick={() => {
                                                    setDirection(1);
                                                    setAvatarPage(p => p + 1);
                                                }}
                                            >
                                                <ChevronRight className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative border rounded-xl overflow-hidden p-2 bg-muted/20 min-h-[180px]">
                                    <AnimatePresence initial={false} custom={direction}>
                                        <motion.div
                                            key={avatarPage}
                                            custom={direction}
                                            variants={{
                                                enter: (direction: number) => ({
                                                    x: direction > 0 ? 100 : -100,
                                                    opacity: 0
                                                }),
                                                center: {
                                                    zIndex: 1,
                                                    x: 0,
                                                    opacity: 1
                                                },
                                                exit: (direction: number) => ({
                                                    zIndex: 0,
                                                    x: direction < 0 ? 100 : -100,
                                                    opacity: 0
                                                })
                                            }}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="grid grid-cols-3 gap-2 w-full"
                                        >
                                            {/* Combine "None" with avatars for pagination */}
                                            {(() => {
                                                const allItems = [
                                                    { id: 'none', isNone: true },
                                                    ...avatars
                                                ];
                                                const pageItems = allItems.slice(avatarPage * 9, (avatarPage + 1) * 9);
                                                
                                                return pageItems.map((item) => (
                                                    item.isNone ? (
                                                        <button
                                                            key="none"
                                                            onClick={() => setSelectedAvatar(null)}
                                                            className={`p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 min-h-[80px]
                                                                ${!selectedAvatar ? 'ring-2 ring-primary bg-primary/10 shadow-glow' : 'hover:bg-muted bg-background border'}`}
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                                <User className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">None</span>
                                                        </button>
                                                    ) : (
                                                        <TooltipProvider key={item.id}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (isAvatarUnlocked(item)) {
                                                                                setSelectedAvatar(item.id);
                                                                            } else {
                                                                                toast({
                                                                                    title: "Avatar Locked!",
                                                                                    description: getUnlockMessage(item),
                                                                                    variant: "destructive"
                                                                                });
                                                                            }
                                                                        }}
                                                                        className={`relative p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 min-h-[80px]
                                                                            ${selectedAvatar === item.id ? 'ring-2 ring-primary bg-primary/10 shadow-glow' : 'hover:bg-muted bg-background border'} 
                                                                            ${!isAvatarUnlocked(item) ? 'opacity-80 grayscale-[0.5]' : ''}`}
                                                                    >
                                                                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                                                                        <span className="text-[10px] font-bold truncate w-full text-center">
                                                                            {item.name.split(' ')[0]}
                                                                        </span>
                                                                        {!isAvatarUnlocked(item) && (
                                                                            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] rounded-lg">
                                                                                <Lock className="w-4 h-4 text-primary drop-shadow-md" />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{isAvatarUnlocked(item) ? item.name : getUnlockMessage(item)}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )
                                                ));
                                            })()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className="flex justify-center gap-1 mt-2">
                                    {Array.from({ length: Math.ceil((avatars.length + 1) / 9) }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 rounded-full transition-all ${i === avatarPage ? 'w-4 bg-primary' : 'w-1.5 bg-border'}`} 
                                        />
                                    ))}
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