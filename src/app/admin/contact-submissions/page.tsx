
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoaderCircle, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';

interface Submission {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

const mockSubmissions: Submission[] = [
    { id: 1, name: 'John Doe', email: 'john.d@example.com', message: 'I have a question about the Deluxe tour package. Is it possible to customize the itinerary?', created_at: subDays(new Date(), 1).toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane.s@example.com', message: 'I would like to inquire about group discounts for a party of 10 people.', created_at: subDays(new Date(), 2).toISOString() },
    { id: 3, name: 'Sam Wilson', email: 'sam.w@example.com', message: 'What are the safety precautions taken during the gem mining activity? Thank you.', created_at: subDays(new Date(), 5).toISOString() },
];


export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For now, we'll use mock data with a delay
    setTimeout(() => {
        setSubmissions(mockSubmissions);
        setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleDelete = (submissionId: number, submissionName: string) => {
    // This is where you would call an API to delete the submission
    // For now, we'll just remove it from the local state
    setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
    toast({
        title: 'Submission Deleted',
        description: `The message from "${submissionName}" has been deleted.`,
    });
  }


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Contact Submissions</h1>
            <p className="text-muted-foreground">Messages sent from the website's contact form.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
          <CardDescription>
            Here are all the messages received from your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <LoaderCircle className="h-12 w-12 text-muted-foreground/50 animate-spin" />
              <p>Loading submissions...</p>
            </div>
          ) : submissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium break-words">{submission.name}</TableCell>
                    <TableCell className="hidden sm:table-cell break-all">{submission.email}</TableCell>
                    <TableCell>{format(new Date(submission.created_at), 'PPP')}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/admin/contact-submissions/${submission.id}/view`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View message from {submission.name}</span>
                            </Link>
                        </Button>
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete message from {submission.name}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="break-words">
                                  This will permanently delete the message from <span className="font-semibold text-foreground">&quot;{submission.name}&quot;</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(submission.id, submission.name)}>
                                  Yes, delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p>There are no contact submissions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
