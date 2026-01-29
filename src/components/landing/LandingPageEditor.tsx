import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LandingPageEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LandingPageEditor({ isOpen, onClose }: LandingPageEditorProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [content, setContent] = useState<SiteContent>(defaultSiteContent);
    const [loading, setLoading] = useState(false);

    const { data: fetchedContent } = useQuery({
        queryKey: ['landing-content-edit'],
        queryFn: async () => {
            try {
                const docRef = doc(db, 'site_settings', 'landing_page');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    return docSnap.data().value as SiteContent;
                }
                return defaultSiteContent;
            } catch (error) {
                console.error('Error fetching landing content:', error);
                return defaultSiteContent;
            }
        },
        enabled: isOpen,
    });

    useEffect(() => {
        if (fetchedContent) {
            setContent(fetchedContent);
        }
    }, [fetchedContent]);

    const saveContent = useMutation({
        mutationFn: async () => {
            const docRef = doc(db, 'site_settings', 'landing_page');
            await setDoc(docRef, {
                value: content,
                updated_at: serverTimestamp()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['landing-content'] });
            queryClient.invalidateQueries({ queryKey: ['landing-content-edit'] });
            toast({ title: 'Landing page updated successfully!' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error updating content', description: error.message, variant: 'destructive' });
        },
    });

    const updateHero = (field: keyof SiteContent['hero'] | string, value: string) => {
        if (field.startsWith('stats.')) {
            const statKey = field.split('.')[1] as keyof SiteContent['hero']['stats'];
            setContent(prev => ({
                ...prev,
                hero: {
                    ...prev.hero,
                    stats: {
                        ...prev.hero.stats,
                        [statKey]: value
                    }
                }
            }));
        } else {
            setContent(prev => ({
                ...prev,
                hero: {
                    ...prev.hero,
                    [field as keyof SiteContent['hero']]: value
                }
            }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await saveContent.mutateAsync();
        } catch (error) {
            console.error('Error saving content:', error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Landing Page Content</DialogTitle>
                    <DialogDescription>
                        Make changes to the website content. Updates will be reflected immediately after saving.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="hero" className="space-y-4 py-4">
                    <TabsList>
                        <TabsTrigger value="hero">Hero Section</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hero Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Badge Text</Label>
                                        <Input value={content.hero.badge} onChange={(e) => updateHero('badge', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title Prefix</Label>
                                        <Input value={content.hero.title_prefix} onChange={(e) => updateHero('title_prefix', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title Highlight</Label>
                                        <Input value={content.hero.title_highlight} onChange={(e) => updateHero('title_highlight', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea value={content.hero.description} onChange={(e) => updateHero('description', e.target.value)} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Primary CTA</Label>
                                        <Input value={content.hero.cta_primary} onChange={(e) => updateHero('cta_primary', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary CTA</Label>
                                        <Input value={content.hero.cta_secondary} onChange={(e) => updateHero('cta_secondary', e.target.value)} />
                                    </div>
                                </div>

                                <h3 className="font-semibold pt-4">Statistics</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Students</Label>
                                        <Input value={content.hero.stats.students} onChange={(e) => updateHero('stats.students', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Competitions</Label>
                                        <Input value={content.hero.stats.competitions} onChange={(e) => updateHero('stats.competitions', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Questions</Label>
                                        <Input value={content.hero.stats.questions} onChange={(e) => updateHero('stats.questions', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Schools Joined</Label>
                                        <Input value={content.hero.stats.schools} onChange={(e) => updateHero('stats.schools', e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features">
                        <Card>
                            <CardHeader>
                                <CardTitle>Features Configuration</CardTitle>
                                <CardDescription>Edit features list as JSON.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>JSON Data</Label>
                                    <Textarea
                                        value={JSON.stringify(content.features, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setContent(prev => ({ ...prev, features: parsed }));
                                            } catch (err) {
                                                // ignore parse error while typing
                                            }
                                        }}
                                        className="font-mono text-xs h-[400px]"
                                    />
                                    <p className="text-xs text-muted-foreground">Valid icons: Trophy, Users, Target, Award, Swords, BookOpen</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handleSave} disabled={saveContent.isPending || loading} className="gradient-hero">
                        {saveContent.isPending || loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}