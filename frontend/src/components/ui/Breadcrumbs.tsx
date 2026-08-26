import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="w-[calc(100%+4rem)] bg-studio-sidebar border-b border-studio-border -mx-8 -mt-6 mb-[15px] px-8 py-[7px] flex items-center">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium text-studio-muted">
        <Link to="/" className="flex items-center text-studio-muted hover:text-brand-orange transition-colors" title="Home">
          <Home className="w-3.5 h-3.5" />
        </Link>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={idx} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3 h-3 text-studio-muted/40 shrink-0" />
              {isLast || (!item.href && !item.onClick) ? (
                <span className={`truncate max-w-[220px] sm:max-w-[340px] ${isLast ? 'text-studio-text font-semibold' : 'text-studio-muted'}`}>
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button type="button" onClick={item.onClick} className="hover:text-brand-orange transition-colors cursor-pointer truncate max-w-[200px]">
                  {item.label}
                </button>
              ) : (
                <Link to={item.href!} className="hover:text-brand-orange transition-colors truncate max-w-[200px]">
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
