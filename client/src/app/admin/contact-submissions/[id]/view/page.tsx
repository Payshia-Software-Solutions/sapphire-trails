
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, User, Mail, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

import { API_BASE_URL } from '@/lib/utils';

interface Submission {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined | null }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-muted-foreground mr-4 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function ViewContactSubmissionPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;
    
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        async function fetchSubmission() {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/contacts/${id}`);
                if (!response.ok) {
                    throw new Error("Submission not found.");
                }
                const data = await response.json();
                setSubmission(data);
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load submission data.' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchSubmission();
    }, [id, toast]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-xl">Submission not found.</p>
                <Button onClick={() => router.push('/admin/contact-submissions')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Submissions
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">View Submission</h1>
                    <p className="text-muted-foreground">Message from {submission.name}.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sender Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow icon={User} label="Full Name" value={submission.name} />
                    <InfoRow icon={Mail} label="Email Address" value={submission.email} />
                    <InfoRow icon={Calendar} label="Date Received" value={format(parseISO(submission.created_at), 'PPP p')} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Message</CardTitle>
                </CardHeader>
                <CardContent className="flex items-start gap-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <p className="text-foreground italic whitespace-pre-wrap">&quot;{submission.message}&quot;</p>
                </CardContent>
            </Card>
        </div>
    );
}
