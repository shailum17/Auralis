/**
 * Accessibility System
 * Comprehensive accessibility utilities and helpers
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ARIA attributes and roles
export const aria = {
  // Common ARIA attributes
  attributes: {
    label: 'aria-label',
    labelledBy: 'aria-labelledby',
    describedBy: 'aria-describedby',
    expanded: 'aria-expanded',
    hidden: 'aria-hidden',
    live: 'aria-live',
    atomic: 'aria-atomic',
    busy: 'aria-busy',
    controls: 'aria-controls',
    current: 'aria-current',
    disabled: 'aria-disabled',
    invalid: 'aria-invalid',
    pressed: 'aria-pressed',
    required: 'aria-required',
    selected: 'aria-selected',
    checked: 'aria-checked',
    valueNow: 'aria-valuenow',
    valueMin: 'aria-valuemin',
    valueMax: 'aria-valuemax',
    valueText: 'aria-valuetext',
    orientation: 'aria-orientation',
    multiSelectable: 'aria-multiselectable',
    hasPopup: 'aria-haspopup',
    level: 'aria-level',
    posInSet: 'aria-posinset',
    setSize: 'aria-setsize',
  },
  
  // Common ARIA roles
  roles: {
    button: 'button',
    link: 'link',
    heading: 'heading',
    banner: 'banner',
    navigation: 'navigation',
    main: 'main',
    complementary: 'complementary',
    contentinfo: 'contentinfo',
    search: 'search',
    form: 'form',
    dialog: 'dialog',
    alertdialog: 'alertdialog',
    alert: 'alert',
    status: 'status',
    log: 'log',
    marquee: 'marquee',
    timer: 'timer',
    tablist: 'tablist',
    tab: 'tab',
    tabpanel: 'tabpanel',
    menu: 'menu',
    menubar: 'menubar',
    menuitem: 'menuitem',
    menuitemcheckbox: 'menuitemcheckbox',
    menuitemradio: 'menuitemradio',
    listbox: 'listbox',
    option: 'option',
    combobox: 'combobox',
    tree: 'tree',
    treeitem: 'treeitem',
    grid: 'grid',
    gridcell: 'gridcell',
    row: 'row',
    rowgroup: 'rowgroup',
    columnheader: 'columnheader',
    rowheader: 'rowheader',
    progressbar: 'progressbar',
    slider: 'slider',
    spinbutton: 'spinbutton',
    textbox: 'textbox',
    checkbox: 'checkbox',
    radio: 'radio',
    switch: 'switch',
    img: 'img',
    figure: 'figure',
    article: 'article',
    section: 'section',
    region: 'region',
    group: 'group',
    list: 'list',
    listitem: 'listitem',
    table: 'table',
    presentation: 'presentation',
    none: 'none',
  },
  
  // Live region politeness levels
  live: {
    off: 'off',
    polite: 'polite',
    assertive: 'assertive',
  },
  
  // Current state values
  current: {
    page: 'page',
    step: 'step',
    location: 'location',
    date: 'date',
    time: 'time',
    true: 'true',
    false: 'false',
  },
} as const;

// Keyboard navigation constants
export const keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
} as const;

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  static getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container);
    return focusableElements[0] || null;
  }

  static getLastFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container);
    return focusableElements[focusableElements.length - 1] || null;
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== keys.TAB) return;

    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  static restoreFocus(element: HTMLElement | null): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}

// Screen reader utilities
export class ScreenReaderUtils {
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  static createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    let liveRegion = document.getElementById(id);
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = id;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    return liveRegion;
  }

  static updateLiveRegion(id: string, message: string): void {
    const liveRegion = document.getElementById(id);
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}

// Accessibility hooks
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const firstFocusable = FocusManager.getFirstFocusableElement(containerRef.current);
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (containerRef.current) {
        FocusManager.trapFocus(containerRef.current, event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      FocusManager.restoreFocus(previousFocusRef.current);
    };
  }, [isActive]);

  return containerRef;
}

export function useAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReaderUtils.announce(message, priority);
  }, []);

  return { announce };
}

export function useKeyboardNavigation(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case keys.ENTER:
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case keys.SPACE:
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case keys.ESCAPE:
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case keys.ARROW_UP:
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case keys.ARROW_DOWN:
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case keys.ARROW_LEFT:
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case keys.ARROW_RIGHT:
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
    }
  }, [onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);

  return { handleKeyDown };
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Accessibility validation utilities
export class AccessibilityValidator {
  static validateHeadingHierarchy(container: HTMLElement): string[] {
    const issues: string[] = [];
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('First heading should be h1');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }
      
      previousLevel = level;
    });

    return issues;
  }

  static validateFormLabels(container: HTMLElement): string[] {
    const issues: string[] = [];
    const inputs = container.querySelectorAll('input, select, textarea');

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        if (!label && !ariaLabel && !ariaLabelledBy) {
          issues.push(`Input with id "${id}" has no associated label`);
        }
      } else if (!ariaLabel && !ariaLabelledBy) {
        issues.push('Input has no id, aria-label, or aria-labelledby');
      }
    });

    return issues;
  }

  static validateColorContrast(element: HTMLElement): boolean {
    // This is a simplified check - in a real implementation,
    // you would use a proper color contrast calculation
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Return true for now - implement actual contrast calculation as needed
    return true;
  }

  static validateAltText(container: HTMLElement): string[] {
    const issues: string[] = [];
    const images = container.querySelectorAll('img');

    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      if (alt === null && role !== 'presentation' && role !== 'none') {
        issues.push('Image missing alt attribute');
      }
      
      if (alt === '') {
        // Empty alt is okay for decorative images
      } else if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
        issues.push('Alt text should not contain "image" or "picture"');
      }
    });

    return issues;
  }
}

// Common accessibility patterns
export const accessibilityPatterns = {
  // Skip link
  skipLink: {
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md',
    href: '#main-content',
    text: 'Skip to main content',
  },
  
  // Focus indicators
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  
  // Screen reader only text
  srOnly: 'sr-only',
  
  // High contrast mode support
  highContrast: 'forced-colors:border forced-colors:border-solid',
  
  // Reduced motion support
  reducedMotion: 'motion-reduce:transition-none motion-reduce:animate-none',
} as const;

// Utility functions
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createAriaAttributes(options: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  hidden?: boolean;
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  busy?: boolean;
  controls?: string;
  current?: string | boolean;
  disabled?: boolean;
  invalid?: boolean;
  pressed?: boolean;
  required?: boolean;
  selected?: boolean;
  checked?: boolean;
  valueNow?: number;
  valueMin?: number;
  valueMax?: number;
  valueText?: string;
  orientation?: 'horizontal' | 'vertical';
  multiSelectable?: boolean;
  hasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  level?: number;
  posInSet?: number;
  setSize?: number;
}) {
  const attributes: Record<string, string | number | boolean> = {};
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      const ariaKey = `aria-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      attributes[ariaKey] = value;
    }
  });
  
  return attributes;
}

export type AccessibilityOptions = Parameters<typeof createAriaAttributes>[0];
export type KeyboardHandler = ReturnType<typeof useKeyboardNavigation>;