import { MobileNavTrigger } from "./mobile-nav";
import { NotificationMenu } from "./notification-menu";

/**
 * Cabeçalho fixo de cada tela do dashboard: título + subtítulo à esquerda,
 * ação opcional e sino de notificações à direita.
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-7 flex items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <MobileNavTrigger className="-ml-1.5 lg:hidden" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action ? <div className="hidden sm:block">{action}</div> : null}
      <NotificationMenu />
    </header>
  );
}
