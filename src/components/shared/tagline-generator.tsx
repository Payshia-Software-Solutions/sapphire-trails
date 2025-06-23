"use client";

import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTaglinesAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface TaglineGeneratorProps {
  sectionDescription: string;
  onTaglineSelect: (tagline: string) => void;
  currentTagline: string;
}

export function TaglineGenerator({ sectionDescription, onTaglineSelect, currentTagline }: TaglineGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTaglines, setGeneratedTaglines] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedTaglines([]);
    const result = await generateTaglinesAction(sectionDescription);
    setIsLoading(false);

    if (result.success && result.taglines) {
      setGeneratedTaglines(result.taglines);
      if (result.taglines.length > 0) {
        onTaglineSelect(result.taglines[0]);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
      <Button onClick={handleGenerate} disabled={isLoading} size="sm" variant="outline">
        {isLoading ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate Suggestions
      </Button>

      {generatedTaglines.length > 0 && (
        <Select onValueChange={onTaglineSelect} defaultValue={currentTagline}>
          <SelectTrigger className="w-full sm:w-[300px] bg-white">
            <SelectValue placeholder="Select a tagline" />
          </SelectTrigger>
          <SelectContent>
            {generatedTaglines.map((tagline, index) => (
              <SelectItem key={index} value={tagline}>
                {tagline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
