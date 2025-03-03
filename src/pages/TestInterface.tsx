import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface Question {
  _id: string;
  text: string;
  options: string[];
  marks: number;
}

interface Test {
  _id: string;
  title: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
}

const TestInterface = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle auto-submit when time runs out
  const handleTimeUp = useCallback(() => {
    submitTest();
  }, []);
  
  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}/questions`);
        setTest(response.data);
        setTimeLeft(response.data.duration * 60);
      } catch (error) {
        console.error('Error fetching test:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);
  
  // Timer countdown
  useEffect(() => {
    if (!loading && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, timeLeft, handleTimeUp]);
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };
  
  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };
  
  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };
  
  // Submit test
  const submitTest = async () => {
    if (!test) return;
    
    setSubmitting(true);
    try {
      const response = await api.post(`/tests/${testId}/submit`, {
        answers: Object.entries(answers).map(([questionId, optionIndex]) => ({
          questionId,
          selectedOption: optionIndex,
        })),
      });
      
      navigate(`/tests/${testId}/results`);
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-40 bg-secondary/50" />
          <Skeleton className="h-8 w-20 bg-secondary/50" />
        </div>
        <Skeleton className="h-2 w-full mb-6 bg-secondary/50" />
        <Skeleton className="h-[400px] w-full rounded-lg bg-secondary/50" />
      </div>
    );
  }
  
  if (!test) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load the test. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / test.questions.length * 100;
  const answeredCount = Object.keys(answers).length;

  // Current question's selected answer
  const currentAnswer = answers[currentQuestion._id];
  
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header with timer and progress */}
      <div className="sticky top-0 bg-background pt-2 pb-4 z-10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{test.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </p>
          </div>
          <div className="flex items-center bg-secondary/40 p-2 rounded-md">
            <Clock className="h-4 w-4 mr-1 text-primary/70" />
            <span className={`font-mono ${timeLeft < 60 ? 'text-destructive font-bold' : 'text-foreground'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-secondary" indicatorClassName="bg-primary" />
      </div>
      
      {/* Question card */}
      <Card className="mb-4 card card-hover-effect border-secondary/40 bg-card">
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create a completely new RadioGroup for each question */}
          <RadioGroup
            key={`question-${currentQuestion._id}`}
            value={currentAnswer !== undefined ? currentAnswer.toString() : undefined}
            onValueChange={(value) => handleAnswerSelect(currentQuestion._id, parseInt(value))}
            className="space-y-2"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={`${currentQuestion._id}-option-${index}`} className="flex items-center space-x-2 py-2 rounded-md px-3 hover:bg-accent/50 transition-colors">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`question-${currentQuestion._id}-option-${index}`} 
                  className="border-primary text-primary" 
                />
                <Label 
                  htmlFor={`question-${currentQuestion._id}-option-${index}`} 
                  className="flex-1 text-card-foreground cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="border-secondary/40 hover:bg-secondary/60"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          {currentQuestionIndex === test.questions.length - 1 ? (
            <Button onClick={() => setShowSubmitDialog(true)} className="btn-glow">
              Submit Test
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="btn-glow">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Question navigation and submit */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center bg-card/50 p-3 rounded-md">
          <div>
            <span className="text-sm font-medium text-card-foreground">Answered: </span>
            <span className="text-sm text-muted-foreground">{answeredCount} of {test.questions.length}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSubmitDialog(true)}
            className="border-secondary/40 hover:bg-secondary/60"
          >
            <Flag className="h-4 w-4 mr-1 text-primary/70" /> Finish Test
          </Button>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {test.questions.map((question, index) => (
            <Button
              key={`nav-${question._id}`}
              variant={index === currentQuestionIndex ? "default" : answers[question._id] !== undefined ? "secondary" : "outline"}
              size="sm"
              className={`h-10 w-10 p-0 ${
                index === currentQuestionIndex 
                  ? "bg-primary text-primary-foreground" 
                  : answers[question._id] !== undefined 
                    ? "bg-secondary text-secondary-foreground" 
                    : "border-secondary/40 text-foreground hover:bg-secondary/60"
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-card border-secondary/40">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Submit Test?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have answered {answeredCount} out of {test.questions.length} questions.
              {answeredCount < test.questions.length && (
                <Alert className="mt-2 border-amber-600/50 bg-amber-950/50 text-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <AlertTitle className="text-amber-300">Warning</AlertTitle>
                  <AlertDescription className="text-amber-200">
                    You have {test.questions.length - answeredCount} unanswered questions.
                  </AlertDescription>
                </Alert>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSubmitDialog(false)} 
              disabled={submitting}
              className="border-secondary/40 hover:bg-secondary/60 text-card-foreground"
            >
              Continue Test
            </Button>
            <Button 
              onClick={submitTest} 
              disabled={submitting}
              className="btn-glow"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestInterface;