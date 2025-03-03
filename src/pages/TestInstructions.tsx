import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { api } from '@/lib/api';

interface Test {
  _id: string;
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  category: {
    name: string;
  };
}

const TestInstructions = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}`);
        setTest(response.data);
      } catch (error) {
        console.error('Error fetching test:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const startTest = () => {
    navigate(`/tests/${testId}/start`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-40 ml-2" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Test Not Found</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The test you're looking for could not be found. Please go back and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">{test.title}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
          <CardDescription>{test.category.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{test.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Questions</p>
                <p className="text-sm text-muted-foreground">{test.totalQuestions} questions</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{test.duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Total Marks</p>
                <p className="text-sm text-muted-foreground">{test.totalMarks} marks</p>
              </div>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Passing Marks</p>
                <p className="text-sm text-muted-foreground">{test.passingMarks} marks</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2">Important Instructions:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>The test will automatically submit when the time is up.</li>
              <li>You can navigate between questions using the next and previous buttons.</li>
              <li>You can review your answers before final submission.</li>
              <li>Once submitted, you cannot retake the test immediately.</li>
              <li>Ensure you have a stable internet connection before starting.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startTest} className="w-full">Start Test</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestInstructions;