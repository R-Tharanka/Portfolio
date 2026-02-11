import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LegalLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary/80">Ruchira Tharanka Portfolio</p>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-foreground/70">{description}</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/70 hover:text-primary"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 space-y-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-sm text-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ruchira Tharanka. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-foreground/50">Legal Pages</span>
            <Link to="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="transition-colors hover:text-primary">Terms of Service</Link>
            <span aria-hidden>·</span>
            <Link to="/cookies" className="transition-colors hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
