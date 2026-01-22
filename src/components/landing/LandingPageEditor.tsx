import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { defaultSiteContent, SiteContent } from '@/lib/siteContent';

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
            const { data, error } = await (supabase as any)
                .from('site_settings')
                .select('value')
                .eq('key', 'landing_page')
                .single();

            if (error || !data) return defaultSiteContent;
            return data.value as SiteContent;
        },
        enabled: isOpen, // Only fetch when open
    });

    useEffect(() => {
        if (fetchedContent && JSON.stringify(fetchedContent) !== JSON.stringify(content)) {
            setContent(fetchedContent);
        }
    }, [fetchedContent, isOpen]);

    const saveContent = useMutation({
        mutationFn: async () => {
            // Always save to localStorage first
            localStorage.setItem('lumora-landing-content', JSON.stringify(content));

            try {
                const { error } = await (supabase as any)
                    .from('site_settings')
                    .upsert({ key: 'landing_page', value: content });

                if (error) {
                    console.warn('Supabase save failed (ignore if table site_settings is missing):', error.message);
                }
            } catch (e) {
                console.warn('Supabase save failed');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['landing-content'] });
            queryClient.invalidateQueries({ queryKey: ['landing-content-edit'] });
            toast({ title: 'Landing page updated successfully!' });
            // Don't close automatically, allow more edits
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
                                        <Label>Answers</Label>
                                        <Input value={content.hero.stats.answers} onChange={(e) => updateHero('stats.answers', e.target.value)} />
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