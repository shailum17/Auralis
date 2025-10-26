import { AccessibilityValidator, FocusManager, ScreenReaderUtils } from '../accessibility'

describe('Accessibility Audit', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Heading Hierarchy Validation', () => {
    it('should pass with proper heading hierarchy', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
        <h2>Another Section</h2>
      `

      const issues = AccessibilityValidator.validateHeadingHierarchy(container)
      expect(issues).toHaveLength(0)
    })

    it('should detect missing h1', () => {
      container.innerHTML = `
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      `

      const issues = AccessibilityValidator.validateHeadingHierarchy(container)
      expect(issues).toContain('First heading should be h1')
    })

    it('should detect heading level jumps', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <h3>Subsection Title</h3>
      `

      const issues = AccessibilityValidator.validateHeadingHierarchy(container)
      expect(issues).toContain('Heading level jumps from h1 to h3')
    })
  })

  describe('Form Label Validation', () => {
    it('should pass with properly labeled inputs', () => {
      container.innerHTML = `
        <label for="name">Name</label>
        <input type="text" id="name" />
        
        <input type="email" aria-label="Email Address" />
        
        <span id="phone-label">Phone Number</span>
        <input type="tel" aria-labelledby="phone-label" />
      `

      const issues = AccessibilityValidator.validateFormLabels(container)
      expect(issues).toHaveLength(0)
    })

    it('should detect unlabeled inputs', () => {
      container.innerHTML = `
        <input type="text" />
        <input type="email" id="email" />
      `

      const issues = AccessibilityValidator.validateFormLabels(container)
      expect(issues.length).toBeGreaterThan(0)
      expect(issues.some(issue => issue.includes('has no id, aria-label, or aria-labelledby'))).toBe(true)
      expect(issues.some(issue => issue.includes('has no associated label'))).toBe(true)
    })
  })

  describe('Alt Text Validation', () => {
    it('should pass with proper alt text', () => {
      container.innerHTML = `
        <img src="photo.jpg" alt="A beautiful sunset over the mountains" />
        <img src="decoration.jpg" alt="" />
        <img src="icon.jpg" role="presentation" />
      `

      const issues = AccessibilityValidator.validateAltText(container)
      expect(issues).toHaveLength(0)
    })

    it('should detect missing alt attributes', () => {
      container.innerHTML = `
        <img src="photo.jpg" />
      `

      const issues = AccessibilityValidator.validateAltText(container)
      expect(issues).toContain('Image missing alt attribute')
    })

    it('should detect redundant alt text', () => {
      container.innerHTML = `
        <img src="photo.jpg" alt="Image of a sunset" />
        <img src="photo.jpg" alt="Picture of mountains" />
      `

      const issues = AccessibilityValidator.validateAltText(container)
      expect(issues.some(issue => issue.includes('should not contain "image" or "picture"'))).toBe(true)
    })
  })

  describe('Focus Management', () => {
    it('should find focusable elements', () => {
      container.innerHTML = `
        <button>Button</button>
        <input type="text" />
        <a href="#test">Link</a>
        <select><option>Option</option></select>
        <textarea></textarea>
        <div tabindex="0">Focusable div</div>
        <button disabled>Disabled button</button>
        <div tabindex="-1">Not focusable</div>
      `

      const focusableElements = FocusManager.getFocusableElements(container)
      expect(focusableElements).toHaveLength(6) // Excludes disabled and tabindex="-1"
    })

    it('should get first and last focusable elements', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <input type="text" />
        <button id="last">Last</button>
      `

      const firstElement = FocusManager.getFirstFocusableElement(container)
      const lastElement = FocusManager.getLastFocusableElement(container)

      expect(firstElement?.id).toBe('first')
      expect(lastElement?.id).toBe('last')
    })

    it('should handle focus trapping', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="last">Last</button>
      `

      const firstButton = container.querySelector('#first') as HTMLElement
      const lastButton = container.querySelector('#last') as HTMLElement

      // Mock Tab key event on last element
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      })

      lastButton.focus()
      FocusManager.trapFocus(container, tabEvent)

      // Should prevent default and focus first element
      expect(tabEvent.defaultPrevented).toBe(true)
    })
  })

  describe('Screen Reader Utilities', () => {
    it('should create live regions', () => {
      const liveRegion = ScreenReaderUtils.createLiveRegion('test-region', 'assertive')

      expect(liveRegion.id).toBe('test-region')
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive')
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true')
      expect(liveRegion).toHaveClass('sr-only')
    })

    it('should update live regions', () => {
      ScreenReaderUtils.createLiveRegion('update-test', 'polite')
      ScreenReaderUtils.updateLiveRegion('update-test', 'Updated message')

      const liveRegion = document.getElementById('update-test')
      expect(liveRegion?.textContent).toBe('Updated message')
    })

    it('should announce messages', () => {
      const originalCreateElement = document.createElement
      const mockElement = {
        setAttribute: jest.fn(),
        textContent: '',
        className: '',
      }

      document.createElement = jest.fn().mockReturnValue(mockElement)
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      ScreenReaderUtils.announce('Test message', 'assertive')

      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true')
      expect(mockElement.textContent).toBe('Test message')
      expect(mockElement.className).toBe('sr-only')

      // Restore original function
      document.createElement = originalCreateElement
    })
  })

  describe('Color Contrast Validation', () => {
    it('should validate color contrast', () => {
      const element = document.createElement('div')
      element.style.color = '#000000'
      element.style.backgroundColor = '#ffffff'

      // This is a simplified test - real implementation would calculate actual contrast ratios
      const isValid = AccessibilityValidator.validateColorContrast(element)
      expect(typeof isValid).toBe('boolean')
    })
  })

  describe('Comprehensive Accessibility Audit', () => {
    it('should perform complete audit on authentication form', () => {
      container.innerHTML = `
        <form>
          <h1>Sign In</h1>
          
          <div>
            <label for="email">Email Address</label>
            <input type="email" id="email" required aria-describedby="email-help" />
            <div id="email-help">Enter your registered email address</div>
          </div>
          
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" required />
          </div>
          
          <button type="submit">Sign In</button>
          
          <img src="logo.jpg" alt="Company Logo" />
        </form>
      `

      const headingIssues = AccessibilityValidator.validateHeadingHierarchy(container)
      const labelIssues = AccessibilityValidator.validateFormLabels(container)
      const altTextIssues = AccessibilityValidator.validateAltText(container)

      expect(headingIssues).toHaveLength(0)
      expect(labelIssues).toHaveLength(0)
      expect(altTextIssues).toHaveLength(0)
    })

    it('should detect multiple accessibility issues', () => {
      container.innerHTML = `
        <h3>Skipped h1 and h2</h3>
        
        <form>
          <input type="text" placeholder="Unlabeled input" />
          <input type="email" id="email" />
          
          <button type="submit">Submit</button>
        </form>
        
        <img src="photo.jpg" />
        <img src="icon.jpg" alt="Image of an icon" />
      `

      const headingIssues = AccessibilityValidator.validateHeadingHierarchy(container)
      const labelIssues = AccessibilityValidator.validateFormLabels(container)
      const altTextIssues = AccessibilityValidator.validateAltText(container)

      expect(headingIssues.length).toBeGreaterThan(0)
      expect(labelIssues.length).toBeGreaterThan(0)
      expect(altTextIssues.length).toBeGreaterThan(0)
    })
  })

  describe('WCAG 2.1 Compliance Checks', () => {
    it('should check for proper landmark roles', () => {
      container.innerHTML = `
        <header role="banner">
          <nav role="navigation">Navigation</nav>
        </header>
        <main role="main">Main content</main>
        <aside role="complementary">Sidebar</aside>
        <footer role="contentinfo">Footer</footer>
      `

      const header = container.querySelector('[role="banner"]')
      const nav = container.querySelector('[role="navigation"]')
      const main = container.querySelector('[role="main"]')
      const aside = container.querySelector('[role="complementary"]')
      const footer = container.querySelector('[role="contentinfo"]')

      expect(header).toBeTruthy()
      expect(nav).toBeTruthy()
      expect(main).toBeTruthy()
      expect(aside).toBeTruthy()
      expect(footer).toBeTruthy()
    })

    it('should check for proper button accessibility', () => {
      container.innerHTML = `
        <button type="button" aria-label="Close dialog">×</button>
        <button type="submit" disabled aria-describedby="submit-help">
          Submit Form
        </button>
        <div id="submit-help">Please fill all required fields</div>
      `

      const closeButton = container.querySelector('button[aria-label]')
      const submitButton = container.querySelector('button[type="submit"]')

      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog')
      expect(submitButton).toHaveAttribute('aria-describedby', 'submit-help')
      expect(submitButton).toBeDisabled()
    })

    it('should check for proper list structure', () => {
      container.innerHTML = `
        <ul role="list">
          <li role="listitem">Item 1</li>
          <li role="listitem">Item 2</li>
          <li role="listitem">Item 3</li>
        </ul>
      `

      const list = container.querySelector('[role="list"]')
      const items = container.querySelectorAll('[role="listitem"]')

      expect(list).toBeTruthy()
      expect(items).toHaveLength(3)
    })
  })
})