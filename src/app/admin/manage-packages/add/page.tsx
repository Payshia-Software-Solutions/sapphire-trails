
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageFormSchema } from '@/lib/schemas';
import type { TourPackage } from '@/lib/packages-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

const iconOptions = ['MapPin', 'Gem', 'Landmark', 'Award', 'Utensils', 'Star', 'Package', 'Coffee', 'BedDouble', 'Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Waves', 'Camera', 'Tent', 'Thermometer'];

export default function AddPackagePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof packageFormSchema>>({
    resolver: zodResolver(packageFormSchema),
    mode: 'onBlur',
    defaultValues: {
      id: '',
      imageUrl: '',
      imageAlt: '',
      imageHint: '',
      title: '',
      description: '',
      features: [{ icon: 'Star', text: '' }],
      price: '',
      priceSuffix: 'per person',
      bookingLink: '/booking',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'features',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: z.infer<typeof packageFormSchema>) {
    const newPackage: TourPackage = {
      id: data.id,
      imageUrl: data.imageUrl,
      imageAlt: data.imageAlt,
      imageHint: data.imageHint,
      title: data.titleLine1 || data.titleLine2 || data.titleLine3 ? {
        line1: data.titleLine1 || '',
        line2: data.titleLine2 || '',
        line3: data.titleLine3 || '',
      } : undefined,
      homepageTitle: data.title,
      homepageDescription: data.description,
      features: data.features.map(f => ({ ...f, icon: f.icon as any})), // Type assertion needed for dynamic icon mapping later
      price: data.price,
      priceSuffix: data.priceSuffix,
      bookingLink: data.bookingLink,
    };

    try {
      const storedPackagesRaw = localStorage.getItem('customPackages');
      const storedPackages = storedPackagesRaw ? JSON.parse(storedPackagesRaw) : [];
      const updatedPackages = [...storedPackages, newPackage];
      localStorage.setItem('customPackages', JSON.stringify(updatedPackages));
      toast({
        title: 'Package Added!',
        description: `Package "${data.title}" has been saved successfully.`,
      });
      router.push('/admin/manage-packages');
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the new package.',
      });
    }
  }
  
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Tour Package</h1>
          <p className="text-muted-foreground">Fill out the form to create a new tour package.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Homepage Card Details</CardTitle>
                  <CardDescription>This information appears on the homepage tour cards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Exclusive Sapphire Mine Tour" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A short description for the homepage card..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tour Page Details</CardTitle>
                  <CardDescription>This information appears on the main tours page. Lines 1 and 3 are optional.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid md:grid-cols-3 gap-4">
                     <FormField control={form.control} name="titleLine1" render={({ field }) => (<FormItem><FormLabel>Title Line 1</FormLabel><FormControl><Input placeholder="e.g., GEM EXPLORER" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="titleLine2" render={({ field }) => (<FormItem><FormLabel>Title Line 2 (Main)</FormLabel><FormControl><Input placeholder="e.g., GEM XPLOR" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="titleLine3" render={({ field }) => (<FormItem><FormLabel>Title Line 3</FormLabel><FormControl><Input placeholder="e.g., DAY TOUR" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   </div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>List the key features of this tour package.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-4 p-4 border rounded-md">
                       <FormField
                          control={form.control}
                          name={`features.${index}.icon`}
                          render={({ field }) => (
                          <FormItem className="flex-1">
                              <FormLabel>Icon</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select icon" /></SelectTrigger></FormControl>
                              <SelectContent>{iconOptions.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField control={form.control} name={`features.${index}.text`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Text</FormLabel><FormControl><Input placeholder="Feature description" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ icon: 'Star', text: '' })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Card>
                <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="id" render={({ field }) => (<FormItem><FormLabel>Unique ID</FormLabel><FormControl><Input placeholder="e.g., new-deluxe-tour" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input placeholder="e.g., $299" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="priceSuffix" render={({ field }) => (<FormItem><FormLabel>Price Suffix</FormLabel><FormControl><Input placeholder="e.g., per person" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="bookingLink" render={({ field }) => (<FormItem><FormLabel>Booking Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Package Image</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={() => (
                      <FormItem>
                        <FormLabel>Upload Image</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <FormLabel>Image Preview</FormLabel>
                      <Image src={imagePreview} alt="Selected image preview" width={200} height={200} className="rounded-md object-cover mt-2 border" />
                    </div>
                  )}
                  <FormField control={form.control} name="imageAlt" render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input placeholder="Describe the image for accessibility" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>Image AI Hint</FormLabel><FormControl><Input placeholder="e.g., tourists mining" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 pt-5 flex justify-end">
            <Button type="submit" size="lg">Save New Package</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
