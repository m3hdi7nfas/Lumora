import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { QuestionSetTimer } from './QuestionSetTimer';
import { Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestionSetPlayerProps {
  questionSet: any;
  questions: any[];
  onComplete: (results: any) => void;
}

export function QuestionSetPlayer({ questionSet, questions, onComplete }: QuestionSetPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeUp, setTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Initialize answers
    const initialAnswers = {};
    questions.forEach((q, index) => {
      initialAnswers[index] = null;
    });
    setAnswers(initialAnswers);
  }, [questions]);

  const handleAnswerSelect = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Calculate score
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        score += q.points || 1;
      }
    });

    const results = {
      questionSetId: questionSet.id,
      score,
      totalPossible: questions.reduce((sum, q) => sum + (q.points || 1), 0),
      answers,
      completedAt: new Date().toISOString(),
      timeUp
    };

    // Simulate submission delay
    setTimeout(() => {
      onComplete(results);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    if (questionSet.auto_submit !== false) {
      handleSubmit();
    }
  };

  const getAnswerStatus = (questionIndex: number) => {
    if (answers[questionIndex] === null) return 'unanswered';
    const question = questions[questionIndex];
    if (answers[questionIndex] === question.correct_answer) return 'correct';
    return 'incorrect';
  };

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      {questionSet.is_timed && (
        <QuestionSetTimer
          durationMinutes={questionSet.time_limit_minutes || 15}
          onTimeUp={handleTimeUp}
          isActive={true}
        />
      )}

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-8 p-0 ${getAnswerStatus(index) === 'correct' ? 'bg-success hover:bg-success/90' :
              getAnswerStatus(index) === 'incorrect' ? 'bg-destructive hover:bg-destructive/90' :
              getAnswerStatus(index) === 'unanswered' ? 'bg-muted hover:bg-muted/80' : ''}`}
            onClick={() => setCurrentQuestionIndex(index)}
            disabled={timeUp}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          <CardDescription>
            {currentQuestion.category} • {currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>

            <RadioGroup
              value={answers[currentQuestionIndex] || ''}
              onValueChange={handleAnswerSelect}
              disabled={timeUp}
            >
              {currentQuestion.options.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${optionIndex}`} />
                  <Label htmlFor={`option-${optionIndex}`} className="flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || timeUp}
            >
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={answers[currentQuestionIndex] === null || timeUp}
                className="gradient-hero"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answers[currentQuestionIndex] === null || isSubmitting || timeUp}
                className="gradient-hero"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Question Set'
                )}
              </Button>
            )}
          </div>

          {/* Time Up Warning */}
          {timeUp && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3 mt-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">
                Time is up! {questionSet.auto_submit !== false ? 'Your answers have been automatically submitted.' : 'Please review your answers and submit manually.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Question Set Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Question Set:</span>
              <span className="font-medium">{questionSet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{questionSet.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Answered:</span>
              <span className="font-medium">
                {Object.values(answers).filter(a => a !== null).length} / {questions.length}
              </span>
            </div>
            {questionSet.is_timed && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Limit:</span>
                <span className="font-medium">
                  {questionSet.time_limit_minutes} minutes
                  {questionSet.auto_submit !== false && ' (auto-submit enabled)'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}