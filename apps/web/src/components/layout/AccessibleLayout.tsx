import { ReactNode } from 'react'
import { SkipLink } from '@/components/ui/SkipLink'
import { cn } from '@/lib/utils'

interface AccessibleLayoutProps {
  children: ReactNode
  className?: string
  
  // Skip links
  skipLinks?: Array<{
    href: string
    text: string
  }>
  
  // Landmark regions
  header?: ReactNode
  navigation?: ReactNode
  main?: ReactNode
  aside?: ReactNode
  footer?: ReactNode
  
  // Page metadata
  pageTitle?: string
  pageDescription?: string
}

export function AccessibleLayout({
  children,
  className,
  skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
  ],
  header,
  navigation,
  main,
  aside,
  footer,
  pageTitle,
  pageDescription,
}: AccessibleLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Skip Links */}
      <div className="sr-only focus-within:not-sr-only">
        {skipLinks.map((link, index) => (
          <SkipLink key={index} href={link.href}>
            {link.text}
          </SkipLink>
        ))}
      </div>

      {/* Page Title for Screen Readers */}
      {pageTitle && (
        <h1 className="sr-only">{pageTitle}</h1>
      )}

      {/* Page Description for Screen Readers */}
      {pageDescription && (
        <div className="sr-only" aria-live="polite">
          {pageDescription}
        </div>
      )}

      {/* Header */}
      {header && (
        <header role="banner" className="flex-shrink-0">
          {header}
        </header>
      )}

      {/* Navigation */}
      {navigation && (
        <nav id="navigation" role="navigation" aria-label="Main navigation">
          {navigation}
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Main Content */}
        <main
          id="main-content"
          role="main"
          className={cn(
            'flex-1',
            aside ? 'lg:mr-64' : '' // Make room for sidebar if present
          )}
        >
          {main || children}
        </main>

        {/* Sidebar/Aside */}
        {aside && (
          <aside
            role="complementary"
            aria-label="Sidebar"
            className="hidden lg:block lg:fixed lg:right-0 lg:top-0 lg:h-full lg:w-64 lg:overflow-y-auto"
          >
            {aside}
          </aside>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <footer role="contentinfo" className="flex-shrink-0">
          {footer}
        </footer>
      )}

      {/* Live Region for Dynamic Announcements */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Assertive Live Region for Urgent Announcements */}
      <div
        id="assertive-live-region"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  )
}

// Specialized layout components
export function AuthLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AccessibleLayout
      className={cn('bg-gradient-primary', className)}
      pageTitle="Authentication"
      pageDescription="Sign in or create an account to access your dashboard"
      skipLinks={[
        { href: '#main-content', text: 'Skip to main content' },
        { href: '#auth-form', text: 'Skip to authentication form' },
      ]}
    >
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center p-4"
        role="main"
      >
        <div id="auth-form" className="w-full max-w-md">
          {children}
        </div>
      </main>
    </AccessibleLayout>
  )
}

export function DashboardLayout({ 
  children, 
  sidebar, 
  header,
  className 
}: { 
  children: ReactNode
  sidebar?: ReactNode
  header?: ReactNode
  className?: string 
}) {
  return (
    <AccessibleLayout
      className={cn('bg-secondary-50', className)}
      pageTitle="Dashboard"
      pageDescription="Your personal dashboard with wellness tracking and academic tools"
      header={header}
      navigation={sidebar}
      skipLinks={[
        { href: '#main-content', text: 'Skip to main content' },
        { href: '#navigation', text: 'Skip to navigation' },
        { href: '#dashboard-widgets', text: 'Skip to dashboard widgets' },
      ]}
    >
      <div id="dashboard-widgets" className="p-6">
        {children}
      </div>
    </AccessibleLayout>
  )
}

export function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps,
  className 
}: { 
  children: ReactNode
  currentStep?: number
  totalSteps?: number
  className?: string 
}) {
  return (
    <AccessibleLayout
      className={cn('bg-gradient-primary', className)}
      pageTitle="Account Setup"
      pageDescription={`Complete your profile setup. ${currentStep && totalSteps ? `Step ${currentStep} of ${totalSteps}` : ''}`}
      skipLinks={[
        { href: '#main-content', text: 'Skip to main content' },
        { href: '#onboarding-form', text: 'Skip to setup form' },
        { href: '#step-navigation', text: 'Skip to step navigation' },
      ]}
    >
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center p-4"
        role="main"
      >
        <div className="w-full max-w-2xl">
          {/* Progress announcement for screen readers */}
          {currentStep && totalSteps && (
            <div className="sr-only" aria-live="polite">
              Step {currentStep} of {totalSteps}
            </div>
          )}
          
          <div id="onboarding-form">
            {children}
          </div>
        </div>
      </main>
    </AccessibleLayout>
  )
}