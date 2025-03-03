import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Award, Clock, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctOption: number;
  marks: number;
}

interface TestResult {
  _id: string;
  testId: {
    _id: string;
    title: string;
    description: string;
    totalMarks: number;
    passingMarks: number;
    category: {
      name: string;
    };
  };
  score: number;
  passed: boolean;
  completedAt: string;
  timeTaken: number;
  answers: {
    questionId: Question;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

const TestResults = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/tests/${testId}/results`);
        setResult(response.data);
      } catch (error) {
        console.error('Error fetching test results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" disabled className="text-primary hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-40 ml-2" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-primary hover:text-primary/80">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Results Not Found</h1>
        </div>
        <Card className="card card-hover-effect">
          <CardHeader>
            <CardTitle>No Results Available</CardTitle>
            <CardDescription>
              We couldn't find any results for this test. Please go back to the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="btn-glow">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const scorePercentage = (result.score / result.testId.totalMarks) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-primary hover:text-primary/80">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Test Results</h1>
      </div>
      
      <Card className={`mb-6 card card-hover-effect ${result.passed ? 'border-passed' : 'border-failed'}`}>
        <CardHeader>
          <CardTitle>{result.testId.title}</CardTitle>
          <CardDescription>{result.testId.category.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="text-center">
              {result.passed ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-emerald-500/10 p-4 mb-2">
                    <CheckCircle className="h-16 w-16 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-emerald-500">Passed!</h2>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-destructive/10 p-4 mb-2">
                    <XCircle className="h-16 w-16 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold text-destructive">Failed</h2>
                </div>
              )}
              <p className="text-3xl font-bold mt-4">
                {result.score}/{result.testId.totalMarks}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Passing marks: {result.testId.passingMarks}
              </p>
            </div>
          </div>
          
          <div className={`h-2 w-full rounded-full bg-secondary overflow-hidden`}>
            <div 
              className={`h-full ${result.passed ? 'bg-emerald-500' : 'bg-destructive'}`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-4 mt-2">
            <div className="flex items-center p-3 rounded-lg bg-secondary/50">
              <Award className="h-6 w-6 mr-3 text-primary" />
              <div>
                <p className="font-medium">Score</p>
                <p className="text-sm text-muted-foreground">
                  {result.score} out of {result.testId.totalMarks}
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-secondary/50">
              <BarChart className="h-6 w-6 mr-3 text-primary" />
              <div>
                <p className="font-medium">Accuracy</p>
                <p className="text-sm text-muted-foreground">
                  {correctAnswers} of {result.answers.length} correct
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-secondary/50">
              <Clock className="h-6 w-6 mr-3 text-primary" />
              <div>
                <p className="font-medium">Time Taken</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(result.timeTaken)}
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-secondary/50">
              <Clock className="h-6 w-6 mr-3 text-primary" />
              <div>
                <p className="font-medium">Completed</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(result.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Questions</TabsTrigger>
          <TabsTrigger value="correct" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Correct ({correctAnswers})</TabsTrigger>
          <TabsTrigger value="incorrect" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Incorrect ({result.answers.length - correctAnswers})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {result.answers.map((answer, index) => (
            <QuestionReview key={index} answer={answer} index={index} />
          ))}
        </TabsContent>
        
        <TabsContent value="correct" className="space-y-4">
          {result.answers
            .filter(answer => answer.isCorrect)
            .map((answer, index) => (
              <QuestionReview key={index} answer={answer} index={index} />
            ))}
        </TabsContent>
        
        <TabsContent value="incorrect" className="space-y-4">
          {result.answers
            .filter(answer => !answer.isCorrect)
            .map((answer, index) => (
              <QuestionReview key={index} answer={answer} index={index} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface QuestionReviewProps {
  answer: {
    questionId: Question;
    selectedOption: number;
    isCorrect: boolean;
  };
  index: number;
}

const QuestionReview = ({ answer, index }: QuestionReviewProps) => {
  const { questionId, selectedOption, isCorrect } = answer;
  
  return (
    <Card className={`card card-hover-effect ${isCorrect ? 'border-passed' : 'border-failed'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">
            {index + 1}. {questionId.text}
          </CardTitle>
          <div>
            {isCorrect ? (
              <div className="rounded-full bg-emerald-500/20 p-1">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            ) : (
              <div className="rounded-full bg-destructive/20 p-1">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            )}
          </div>
        </div>
        <CardDescription>
          {questionId.marks} {questionId.marks === 1 ? 'mark' : 'marks'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {questionId.options.map((option, i) => (
          <div
            key={i}
            className={`p-3 rounded-md ${
              i === questionId.correctOption
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : i === selectedOption && !isCorrect
                ? 'bg-destructive/10 border border-destructive/30'
                : 'bg-secondary/50'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-2">
                {i === questionId.correctOption ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : i === selectedOption && !isCorrect ? (
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                ) : (
                  <span className="h-4 w-4 block" />
                )}
              </div>
              <span>{option}</span>
            </div>
          </div>
        ))}
        
        {!isCorrect && (
          <>
            <Separator className="bg-muted/50" />
            <div className="text-sm p-2 bg-secondary/30 rounded-md">
              <span className="font-medium text-primary">Correct answer: </span>
              {questionId.options[questionId.correctOption]}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TestResults;