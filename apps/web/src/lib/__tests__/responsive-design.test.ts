import { responsive, containers, grid, flex, space, text, form, motion, responsiveClass, createResponsiveVariant, useResponsive } from '../responsive-utils'

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('Responsive Design System', () => {
  describe('Breakpoint Utilities', () => {
    it('should provide correct media queries', () => {
      expect(responsive.sm).toBe('@media (min-width: 640px)')
      expect(responsive.md).toBe('@media (min-width: 768px)')
      expect(responsive.lg).toBe('@media (min-width: 1024px)')
      expect(responsive.xl).toBe('@media (min-width: 1280px)')
      expect(responsive['2xl']).toBe('@media (min-width: 1536px)')
    })

    it('should provide max-width breakpoints', () => {
      expect(responsive['max-sm']).toBe('@media (max-width: 640px)')
      expect(responsive['max-md']).toBe('@media (max-width: 768px)')
      expect(responsive['max-lg']).toBe('@media (max-width: 1024px)')
      expect(responsive['max-xl']).toBe('@media (max-width: 1280px)')
    })

    it('should provide range breakpoints', () => {
      expect(responsive['sm-md']).toBe('@media (min-width: 640px) and (max-width: 768px)')
      expect(responsive['md-lg']).toBe('@media (min-width: 768px) and (max-width: 1024px)')
      expect(responsive['lg-xl']).toBe('@media (min-width: 1024px) and (max-width: 1280px)')
    })
  })

  describe('Container Utilities', () => {
    it('should provide consistent container classes', () => {
      expect(containers.sm).toBe('max-w-sm mx-auto px-4')
      expect(containers.md).toBe('max-w-md mx-auto px-4')
      expect(containers.lg).toBe('max-w-lg mx-auto px-4')
      expect(containers.full).toBe('w-full px-4')
      expect(containers.screen).toBe('min-h-screen')
    })
  })

  describe('Grid Utilities', () => {
    it('should provide responsive grid columns', () => {
      expect(grid.cols[1]).toBe('grid-cols-1')
      expect(grid.cols[2]).toBe('grid-cols-1 sm:grid-cols-2')
      expect(grid.cols[3]).toBe('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
      expect(grid.cols[4]).toBe('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')
    })

    it('should provide responsive gap utilities', () => {
      expect(grid.gap.sm).toBe('gap-2 sm:gap-3')
      expect(grid.gap.md).toBe('gap-3 sm:gap-4')
      expect(grid.gap.lg).toBe('gap-4 sm:gap-6')
      expect(grid.gap.xl).toBe('gap-6 sm:gap-8')
    })
  })

  describe('Flex Utilities', () => {
    it('should provide common flex patterns', () => {
      expect(flex.center).toBe('flex items-center justify-center')
      expect(flex.between).toBe('flex items-center justify-between')
      expect(flex.start).toBe('flex items-center justify-start')
      expect(flex.end).toBe('flex items-center justify-end')
      expect(flex.col).toBe('flex flex-col')
      expect(flex.colCenter).toBe('flex flex-col items-center justify-center')
    })

    it('should provide responsive flex direction', () => {
      expect(flex.responsive.colToRow).toBe('flex flex-col sm:flex-row')
      expect(flex.responsive.rowToCol).toBe('flex flex-row sm:flex-col')
    })
  })

  describe('Spacing Utilities', () => {
    it('should provide section spacing', () => {
      expect(space.section.sm).toBe('py-8 sm:py-12')
      expect(space.section.md).toBe('py-12 sm:py-16')
      expect(space.section.lg).toBe('py-16 sm:py-20')
      expect(space.section.xl).toBe('py-20 sm:py-24')
    })

    it('should provide component spacing', () => {
      expect(space.component.sm).toBe('p-4 sm:p-6')
      expect(space.component.md).toBe('p-6 sm:p-8')
      expect(space.component.lg).toBe('p-8 sm:p-10')
    })

    it('should provide stack and inline spacing', () => {
      expect(space.stack.xs).toBe('space-y-1')
      expect(space.stack.sm).toBe('space-y-2')
      expect(space.stack.md).toBe('space-y-4')
      
      expect(space.inline.xs).toBe('space-x-1')
      expect(space.inline.sm).toBe('space-x-2')
      expect(space.inline.md).toBe('space-x-4')
    })
  })

  describe('Typography Utilities', () => {
    it('should provide responsive font sizes', () => {
      expect(text.responsive.xs).toBe('text-xs')
      expect(text.responsive.sm).toBe('text-sm')
      expect(text.responsive.base).toBe('text-sm sm:text-base')
      expect(text.responsive.lg).toBe('text-base sm:text-lg')
      expect(text.responsive.xl).toBe('text-lg sm:text-xl')
    })

    it('should provide heading scales', () => {
      expect(text.heading.h1).toBe('text-2xl sm:text-3xl lg:text-4xl font-bold')
      expect(text.heading.h2).toBe('text-xl sm:text-2xl lg:text-3xl font-semibold')
      expect(text.heading.h3).toBe('text-lg sm:text-xl lg:text-2xl font-semibold')
    })

    it('should provide body text styles', () => {
      expect(text.body.sm).toBe('text-sm leading-relaxed')
      expect(text.body.base).toBe('text-base leading-relaxed')
      expect(text.body.lg).toBe('text-lg leading-relaxed')
    })
  })

  describe('Form Utilities', () => {
    it('should provide form containers', () => {
      expect(form.container).toBe('space-y-4 sm:space-y-6')
      expect(form.group).toBe('space-y-2')
    })

    it('should provide responsive form grids', () => {
      expect(form.grid.single).toBe('grid grid-cols-1 gap-4 sm:gap-6')
      expect(form.grid.double).toBe('grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6')
      expect(form.grid.triple).toBe('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6')
    })

    it('should provide button group layouts', () => {
      expect(form.buttons.single).toBe('flex justify-center')
      expect(form.buttons.double).toBe('flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between')
      expect(form.buttons.group).toBe('flex flex-col sm:flex-row gap-3 sm:gap-4')
    })
  })

  describe('Motion Utilities', () => {
    it('should provide transition classes', () => {
      expect(motion.transition.fast).toBe('transition-all duration-150 ease-in-out')
      expect(motion.transition.normal).toBe('transition-all duration-200 ease-in-out')
      expect(motion.transition.slow).toBe('transition-all duration-300 ease-in-out')
    })

    it('should provide transform utilities', () => {
      expect(motion.transform.hover).toBe('hover:scale-105 hover:-translate-y-1')
      expect(motion.transform.press).toBe('active:scale-95')
      expect(motion.transform.focus).toBe('focus:scale-105')
    })

    it('should provide animation classes', () => {
      expect(motion.animate.fadeIn).toBe('animate-fade-in')
      expect(motion.animate.fadeInUp).toBe('animate-fade-in-up')
      expect(motion.animate.slideInRight).toBe('animate-slide-in-right')
    })
  })

  describe('Utility Functions', () => {
    it('should combine responsive classes correctly', () => {
      const result = responsiveClass('text-sm', 'sm:text-base', null, false, 'lg:text-lg')
      expect(result).toBe('text-sm sm:text-base lg:text-lg')
    })

    it('should create responsive variants', () => {
      const variants = {
        small: 'text-sm',
        large: 'text-lg',
      }
      
      const responsiveVariants = createResponsiveVariant(variants, 'md')
      expect(responsiveVariants.small).toBe('text-sm md:text-sm')
      expect(responsiveVariants.large).toBe('text-lg md:text-lg')
    })
  })

  describe('Responsive Hook', () => {
    beforeEach(() => {
      // Reset window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
    })

    it('should detect desktop breakpoint', () => {
      const result = useResponsive()
      expect(result.isDesktop).toBe(true)
      expect(result.isMobile).toBe(false)
      expect(result.isTablet).toBe(false)
      expect(result.breakpoint).toBe('lg')
    })

    it('should detect mobile breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })
      
      const result = useResponsive()
      expect(result.isMobile).toBe(true)
      expect(result.isTablet).toBe(false)
      expect(result.isDesktop).toBe(false)
      expect(result.breakpoint).toBe('sm')
    })

    it('should detect tablet breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })
      
      const result = useResponsive()
      expect(result.isMobile).toBe(false)
      expect(result.isTablet).toBe(true)
      expect(result.isDesktop).toBe(false)
      expect(result.breakpoint).toBe('md')
    })

    it('should handle server-side rendering', () => {
      // Mock window as undefined (SSR environment)
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const result = useResponsive()
      expect(result.isDesktop).toBe(true)
      expect(result.isMobile).toBe(false)
      expect(result.isTablet).toBe(false)
      expect(result.breakpoint).toBe('lg') // Default when window is undefined
      
      // Restore window
      global.window = originalWindow
    })
  })

  describe('Responsive Component Testing', () => {
    it('should test responsive button sizes', () => {
      const buttonClasses = responsiveClass(
        'px-4 py-2',
        'sm:px-6 sm:py-3',
        'lg:px-8 lg:py-4'
      )
      
      expect(buttonClasses).toBe('px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4')
    })

    it('should test responsive card layouts', () => {
      const cardGridClasses = responsiveClass(
        grid.cols[1],
        'md:' + grid.cols[2],
        'lg:' + grid.cols[3]
      )
      
      expect(cardGridClasses).toContain('grid-cols-1')
      expect(cardGridClasses).toContain('sm:grid-cols-2')
      expect(cardGridClasses).toContain('lg:grid-cols-3')
    })

    it('should test responsive navigation', () => {
      const navClasses = responsiveClass(
        'flex flex-col',
        'md:flex-row',
        'md:items-center',
        'md:space-x-6'
      )
      
      expect(navClasses).toBe('flex flex-col md:flex-row md:items-center md:space-x-6')
    })

    it('should test responsive form layouts', () => {
      const formClasses = responsiveClass(
        form.grid.single,
        'md:' + form.grid.double
      )
      
      expect(formClasses).toContain('grid-cols-1')
      expect(formClasses).toContain('sm:grid-cols-2')
    })
  })

  describe('Cross-Device Compatibility', () => {
    const testBreakpoints = [
      { width: 320, name: 'Mobile Small', expected: 'xs' },
      { width: 640, name: 'Mobile Large', expected: 'sm' },
      { width: 768, name: 'Tablet Portrait', expected: 'md' },
      { width: 1024, name: 'Tablet Landscape', expected: 'lg' },
      { width: 1280, name: 'Desktop', expected: 'xl' },
      { width: 1920, name: 'Large Desktop', expected: '2xl' },
    ]

    testBreakpoints.forEach(({ width, name, expected }) => {
      it(`should handle ${name} (${width}px) correctly`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        })
        
        const result = useResponsive()
        expect(result.breakpoint).toBe(expected)
      })
    })
  })

  describe('Performance Considerations', () => {
    it('should provide efficient class combinations', () => {
      const startTime = performance.now()
      
      // Test multiple class combinations
      for (let i = 0; i < 1000; i++) {
        responsiveClass(
          'text-sm',
          'sm:text-base',
          'md:text-lg',
          'lg:text-xl',
          'xl:text-2xl'
        )
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete 1000 operations in reasonable time (< 10ms)
      expect(duration).toBeLessThan(10)
    })

    it('should handle large class lists efficiently', () => {
      const largeClassList = Array.from({ length: 50 }, (_, i) => `class-${i}` as string | null | false | undefined).concat([
        null,
        false,
        undefined,
        '',
      ])
      
      const result = responsiveClass(...largeClassList)
      expect(result.split(' ')).toHaveLength(50) // Only valid classes
    })
  })
})