import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface Test {
  _id: string;
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  duration: number;
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

const TestList = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, testsRes] = await Promise.all([
          api.get(`/categories/${categoryId}`),
          api.get(`/categories/${categoryId}/tests`)
        ]);
        
        setCategory(categoryRes.data);
        setTests(testsRes.data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-primary hover:text-primary/80">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          {loading ? <Skeleton className="h-8 w-40" /> : category?.name}
        </h1>
      </div>
      
      <div className="mb-8">
        <p className="text-muted-foreground">
          {loading ? <Skeleton className="h-4 w-full" /> : category?.description}
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[150px] w-full rounded-lg" />
            </div>
          ))
        ) : tests.length > 0 ? (
          tests.map((test) => (
            <Link key={test._id} to={`/tests/${test._id}/instructions`} className="block">
              <Card className="card card-hover-effect hover:bg-accent transition-all duration-300 hover:scale-[1.01]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                    {test.title}
                  </CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/50">
                      <FileText className="h-5 w-5 mb-2 text-primary" />
                      <span>{test.totalQuestions} Questions</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/50">
                      <Award className="h-5 w-5 mb-2 text-primary" />
                      <span>{test.passingMarks}/{test.totalMarks} to Pass</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/50">
                      <Clock className="h-5 w-5 mb-2 text-primary" />
                      <span>{test.duration} Minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="card card-hover-effect bg-secondary/30">
            <CardHeader>
              <CardTitle>No tests available</CardTitle>
              <CardDescription>
                There are no tests available in this category yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-primary hover:text-primary-foreground transition-colors">
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestList;