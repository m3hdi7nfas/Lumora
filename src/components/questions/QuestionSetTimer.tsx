import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionSetTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function QuestionSetTimer({ durationMinutes, onTimeUp, isActive }: QuestionSetTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive) return;

    // Reset timer when duration changes
    setTimeLeft(durationMinutes * 60);
    setIsWarning(false);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          toast({
            title: 'Time is up!',
            description: 'Your question set has been automatically submitted.',
            variant: 'destructive'
          });
          return 0;
        }

        // Show warning when 1 minute left
        if (prev === 60) {
          setIsWarning(true);
          toast({
            title: '1 minute remaining!',
            description: 'Your time is almost up.',
            variant: 'warning'
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes, isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${isWarning ? 'border-warning bg-warning/10' : 'border-primary bg-primary/10'}`}>
      <div className="flex items-center gap-3">
        <Clock className={`w-6 h-6 ${isWarning ? 'text-warning' : 'text-primary'}`} />
        <div>
          <p className="text-sm font-medium">Time Remaining</p>
          <p className={`text-2xl font-bold ${isWarning ? 'text-warning' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
        {isWarning && (
          <AlertTriangle className="w-6 h-6 text-warning animate-pulse" />
        )}
      </div>
    </div>
  );
}