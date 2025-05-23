import FaceSorterClient from '@/components/face-sorter-client';
import { FolderKanban } from 'lucide-react'; // Using FolderKanban as a representative icon

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/10 text-primary">
            <FolderKanban size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Face Sorter
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Effortlessly organize your photos by detected faces.
          </p>
        </header>
        <FaceSorterClient />
      </div>
      <footer className="py-8 mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Face Sorter. All rights reserved.</p>
        <p className="text-xs mt-1">Note: Face recognition and file operations are simulated in this demo.</p>
      </footer>
    </main>
  );
}
