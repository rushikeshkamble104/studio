"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, CheckCircle, XCircle, Info, ListChecks, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Status = 'idle' | 'processing' | 'completed' | 'error';

export default function FaceSorterClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [processedFileNames, setProcessedFileNames] = useState<string[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
      setStatus('idle');
      setMessage(selectedFiles.length > 0 ? `${selectedFiles.length} image(s) selected. Ready to sort.` : "No folder/files selected.");
      setProcessedFileNames([]);
      setProgress(0); // Reset progress when new files are selected
    }
  };

  const resetState = () => {
    setFiles([]);
    setProgress(0);
    setStatus('idle');
    setMessage(null);
    setProcessedFileNames([]);
    // Reset file input visually - this is a bit tricky, common hack is to reset the form or input value
    const fileInput = document.getElementById('folder-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleStartSorting = () => {
    if (files.length === 0) {
      setStatus('error');
      setMessage('Please select a folder with images first.');
      return;
    }

    setStatus('processing');
    setMessage('Initializing sorting process...');
    setProgress(0);
    setProcessedFileNames([]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (status === 'processing' && files.length > 0) {
      const totalDuration = Math.min(Math.max(files.length * 200, 2000), 8000); // 0.2s per file, min 2s, max 8s
      const increment = 100 / (totalDuration / 100); // Progress increment per 100ms

      setMessage(`Processing ${files.length} image(s)...`);
      
      let currentProgress = 0;
      let filesProcessedThisInterval = 0;
      const filesToDisplayPerUpdate = Math.ceil(files.length / (totalDuration / 100));

      interval = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= 100) {
          clearInterval(interval!);
          setProgress(100);
          setStatus('completed');
          const numPeople = Math.max(1, Math.ceil(files.length / 5)); // Simulate identified people
          setMessage(`Sorting complete! Processed ${files.length} images. Identified ${numPeople} unique individuals and organized photos into ${numPeople} folders.`);
          setProcessedFileNames(files.map(f => f.name)); 
        } else {
          setProgress(currentProgress);
          // Simulate adding processed file names
          const nextBatch = files
            .slice(filesProcessedThisInterval, filesProcessedThisInterval + filesToDisplayPerUpdate)
            .map(f => f.name);
          setProcessedFileNames(prev => [...prev, ...nextBatch]);
          filesProcessedThisInterval += filesToDisplayPerUpdate;
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status, files]);

  const getAlertVariant = (): "default" | "destructive" => {
    if (status === 'error') return 'destructive';
    return 'default';
  };

  const AlertIcon = () => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-destructive" />;
    if (status === 'processing') return <Info className="h-5 w-5 text-blue-500 animate-pulse" />;
    return <Info className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="w-7 h-7 mr-3 text-primary" />
          Upload Your Image Folder
        </CardTitle>
        <CardDescription>
          Select the folder containing all your photos. The app will (simulate) detecting faces and organizing them.
          <br />
          <span className="text-xs text-muted-foreground">Note: Browser folder selection support varies. You might need to select all files within the folder.</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="folder-input" className="sr-only">Select folder</label>
          <Input
            id="folder-input"
            type="file"
            // @ts-ignore because webkitdirectory is non-standard
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFileChange}
            disabled={status === 'processing'}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
        </div>

        {files.length > 0 && status !== 'processing' && status !== 'completed' && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium text-foreground">{files.length} file(s) ready for processing:</p>
            <ScrollArea className="h-24 mt-1">
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                {files.slice(0, 10).map(file => <li key={file.name}>{file.name}</li>)}
                {files.length > 10 && <li>...and {files.length - 10} more.</li>}
              </ul>
            </ScrollArea>
          </div>
        )}

        {status === 'processing' && (
          <div className="space-y-2 pt-2">
            <Progress value={progress} className="w-full [&>div]:bg-accent transition-all duration-100 ease-linear" />
            <p className="text-sm text-center text-accent-foreground">{Math.round(progress)}% complete</p>
          </div>
        )}
        
        {message && (status !== 'idle' || files.length > 0) && (
          <Alert variant={getAlertVariant()} className="transition-all duration-300 ease-in-out">
            <div className="flex items-start">
              <div className="pt-0.5 mr-3"><AlertIcon /></div>
              <div>
                <AlertTitle className="font-semibold">
                  {status === 'idle' && "Status"}
                  {status === 'processing' && "Processing..."}
                  {status === 'completed' && "Success!"}
                  {status === 'error' && "Error"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {status === 'completed' && processedFileNames.length > 0 && (
           <div className="mt-4 p-4 bg-muted/50 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-foreground mb-2 flex items-center">
              <ListChecks className="w-5 h-5 mr-2 text-green-600" />
              Processed Files (Simulated)
            </h3>
            <ScrollArea className="h-32 border rounded-md p-2 bg-background">
              <ul className="text-sm text-muted-foreground space-y-1">
                {processedFileNames.slice(0,15).map((name, index) => (
                  <li key={index} className="truncate">{name}</li>
                ))}
                {processedFileNames.length > 15 && <li className="font-medium">... and {processedFileNames.length - 15} more files.</li>}
              </ul>
            </ScrollArea>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-end space-x-3">
        {status === 'completed' || status === 'error' ? (
          <Button onClick={resetState} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Sort Another Folder
          </Button>
        ) : (
          <Button 
            onClick={handleStartSorting} 
            disabled={status === 'processing' || files.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {status === 'processing' ? 'Sorting...' : 'Start Sorting'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
