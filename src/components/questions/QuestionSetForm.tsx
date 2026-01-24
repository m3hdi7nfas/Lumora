import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestionSetFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function QuestionSetForm({ initialData, onSubmit, onCancel, isLoading }: QuestionSetFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: 'general',
    questions_count: 0,
    is_timed: false,
    time_limit_minutes: 15,
    auto_submit: true,
    created_at: '',
    updated_at: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'general',
        questions_count: initialData.questions_count || 0,
        is_timed: initialData.is_timed || false,
        time_limit_minutes: initialData.time_limit_minutes || 15,
        auto_submit: initialData.auto_submit !== false, // default to true
        created_at: initialData.created_at || '',
        updated_at: initialData.updated_at || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    if (formData.is_timed && (!formData.time_limit_minutes || formData.time_limit_minutes <= 0)) {
      toast({ title: 'Time limit must be greater than 0', variant: 'destructive' });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Question Set Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Math Challenge Set"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose of this question set"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="math">Math</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="language">Language</SelectItem>
              <SelectItem value="competition">Competition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="questions_count">Number of Questions</Label>
          <Input
            id="questions_count"
            type="number"
            value={formData.questions_count}
            onChange={(e) => setFormData({ ...formData, questions_count: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>

        {/* Timer Settings */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Timer Settings
            </CardTitle>
            <CardDescription>Configure time limits for this question set</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_timed"
                checked={formData.is_timed}
                onCheckedChange={(checked) => setFormData({ ...formData, is_timed: checked })}
              />
              <Label htmlFor="is_timed" className="font-medium">
                Enable Timer for this Question Set
              </Label>
            </div>

            {formData.is_timed && (
              <>
                <div className="space-y-2 ml-6">
                  <Label htmlFor="time_limit">Time Limit (minutes) *</Label>
                  <div className="relative">
                    <Input
                      id="time_limit"
                      type="number"
                      value={formData.time_limit_minutes}
                      onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="180"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      minutes
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set the maximum time allowed for completing this question set (1-180 minutes)
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  <Checkbox
                    id="auto_submit"
                    checked={formData.auto_submit}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_submit: checked })}
                  />
                  <Label htmlFor="auto_submit" className="font-medium">
                    Auto-submit when time expires
                  </Label>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                        <li>Once the timer starts, it cannot be paused or reset</li>
                        <li>Students will see a countdown timer during the question set</li>
                        <li>When time expires, the set will automatically submit if auto-submit is enabled</li>
                        <li>Recommended time limits: 10-30 minutes for most question sets</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-hero" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Question Set'
          )}
        </Button>
      </div>
    </form>
  );
}