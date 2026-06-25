
'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditContactSubmissionPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Submission</h1>
                    <p className="text-muted-foreground">Editing a contact message.</p>
                </div>
            </div>
             <div className="text-center text-muted-foreground py-16">
                <p>This is the placeholder page to edit a contact submission.</p>
             </div>
        </div>
    )
}
