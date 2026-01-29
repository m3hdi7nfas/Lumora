import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface QuestionRepetitionToggleProps {
  questionId: string;
  sectionId: string;
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export function QuestionRepetitionToggle({
  questionId,
  sectionId,
  initialValue = true,
  onToggle
}: QuestionRepetitionToggleProps) {
  const [allowRepetition, setAllowRepetition] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      setAllowRepetition(checked);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('questionRepetitionChanged', {
        detail: { questionId, sectionId, allowRepetition: checked }
      }));

      // API call to update question repetition settings in Firestore
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        allow_repetition: checked,
        updated_at: serverTimestamp()
      });

      onToggle?.(checked);

      toast({
        title: 'Question repetition updated',
        description: `Question repetition is now ${checked ? 'allowed' : 'not allowed'}`
      });
    } catch (error: any) {
      toast({
        title: 'Error updating question repetition',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-primary" />
        <Label htmlFor={`repetition-toggle-${questionId}`} className="text-sm">
          Allow Question Repetition
        </Label>
      </div>
      <Switch
        id={`repetition-toggle-${questionId}`}
        checked={allowRepetition}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  );
}