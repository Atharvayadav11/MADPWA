import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, BookOpen, Clock, Award, Moon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface TestAttempt {
  _id: string;
  testId: {
    _id: string;
    title: string;
    category: {
      name: string;
    };
    totalMarks: number;
    passingMarks: number;
  };
  score: number;
  completedAt: string;
  passed: boolean;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, attemptsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/attempts')
        ]);
        
        setCategories(categoriesRes.data);
        setAttempts(attemptsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className=" font-bold text-foreground">
          <span className="text-3xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Pariksha
          </span>
          <p className=" text-2xl text-muted-foreground">Challenge your knowledge!</p>
        </h1>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Moon className="h-5 w-5 text-purple-300" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Welcome, {user?.name}</h2>
        <p className="text-muted-foreground">Select a category to start a quiz or review your previous attempts.</p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary">
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Categories</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-[125px] w-full rounded-lg bg-secondary/50" />
              </div>
            ))
          ) : (
            categories.map((category) => (
              <Link key={category._id} to={`/categories/${category._id}`}>
                <Card className="hover:bg-accent transition-colors card card-hover-effect border-secondary/40 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-card-foreground">{category.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="mr-1 h-4 w-4 text-primary/70" />
                      <span>Multiple tests available</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-[125px] w-full rounded-lg bg-secondary/50" />
              </div>
            ))
          ) : attempts.length > 0 ? (
            attempts.map((attempt) => (
              <Link key={attempt._id} to={`/tests/${attempt.testId._id}/results`}>
                <Card className={`card card-hover-effect transition-colors border-secondary/40 bg-card ${attempt.passed ? 'border-passed' : 'border-failed'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-card-foreground">{attempt.testId.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{attempt.testId.category.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm">
                        <Award className={`mr-1 h-4 w-4 ${attempt.passed ? 'text-emerald-400' : 'text-red-400'}`} />
                        <span className={attempt.passed ? 'text-emerald-400' : 'text-red-400'}>
                          Score: {attempt.score}/{attempt.testId.totalMarks}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4 text-primary/70" />
                        <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="bg-card border-secondary/40">
              <CardHeader>
                <CardTitle className="text-card-foreground">No attempts yet</CardTitle>
                <CardDescription className="text-muted-foreground">
                  You haven't taken any tests yet. Go to the Categories tab to start a test.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      <footer className='mt-20'>
  <p className="text-muted-foreground text-justify" style={{ textAlign: "justify", textJustify: "inter-word" }}>
    Developed by Atharva Yadav [T23-101], Pratik Vishe [T23-100], Simran Yewle [T23-102] as a part of the course project for the course "MAD Lab" at TSEC.
  </p>
</footer>

    </div>
  );
};

export default Dashboard;