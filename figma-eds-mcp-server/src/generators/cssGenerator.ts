import { BlockAnalysis } from '../types.js';

export class CSSGenerator {

  /**
   * Generate CSS for a block based on analysis
   */
  async generate(analysis: BlockAnalysis): Promise<string> {
    const css = this.createCSS(analysis);
    return css;
  }

  private createCSS(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const sections = [];

    // Header comment
    sections.push(`/* ${this.capitalize(blockName.replace(/-/g, ' '))} Block */`);

    // Container styling
    sections.push(this.generateContainerStyles(blockName));

    // Main block styles
    sections.push(this.generateMainBlockStyles(analysis));

    // Content styles based on block type
    if (analysis.blockType === 'multi-item') {
      sections.push(this.generateMultiItemStyles(analysis));
    } else {
      sections.push(this.generateSingleItemStyles(analysis));
    }

    // Button styles if needed
    if (this.hasButtons(analysis)) {
      sections.push(this.generateButtonStyles(analysis));
    }

    // Empty state styles for Universal Editor
    sections.push(this.generateEmptyStateStyles(blockName));

    // Responsive styles
    sections.push(this.generateResponsiveStyles(analysis));

    return sections.join('\n\n');
  }

  private generateContainerStyles(blockName: string): string {
    return `/* Container styling */
.${blockName}-container .${blockName}-wrapper {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}`;
  }

  private generateMainBlockStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const jsPattern = analysis.contentStructure.jsPattern || 'decorated';
    
    // Cards pattern uses container-type for responsive behavior
    if (jsPattern === 'cards') {
      return `.${blockName} {
  container-type: inline-size;
  padding: var(--spacing-m) 0;
}`;
    }
    
    return `.${blockName} {
  padding: var(--spacing-xl) var(--grid-margin);
}`;
  }

  private generateMultiItemStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const jsPattern = analysis.contentStructure.jsPattern || 'decorated';
    
    // Use carousel pattern styling if jsPattern is 'carousel'
    if (jsPattern === 'carousel') {
      return this.generateCarouselPatternStyles(analysis);
    }
    
    // Use cards pattern styling if jsPattern is 'cards'
    if (jsPattern === 'cards') {
      return this.generateCardsPatternStyles(analysis);
    }
    
    const styles = [];

    // Container heading if present
    if (analysis.contentStructure.containerFields.some(f => f.name.includes('heading'))) {
      styles.push(`/* Main heading uses design system typography automatically */
.${blockName} .container-heading {
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
  text-align: left;
}`);
    }

    // Items container with responsive grid
    styles.push(`/* Items container with responsive grid */
.${blockName} .items-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  max-width: var(--grid-max-width);
  margin: 0 auto;
}`);

    // Individual item styling
    styles.push(`/* Individual item styling */
.${blockName} .item {
  background: var(--surface-white);
  border: 1px solid var(--border-tertiary);
  padding: var(--spacing-l);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
  grid-column: span var(--grid-columns); /* Full width on mobile */
}`);

    // Item heading
    styles.push(`/* Item heading */
.${blockName} .item-heading {
  color: var(--text-primary);
  margin: 0;
  font-family: var(--heading-font-family);
  font-weight: var(--font-weight-headings);
  font-size: var(--heading-font-size-l);
  line-height: var(--line-height-headings-l);
}`);

    // Item body text
    styles.push(`/* Item body text */
.${blockName} .item-body {
  color: var(--text-primary);
  font-family: var(--body-font-family);
  font-weight: var(--font-weight-regular);
  font-size: var(--font-size-body-l);
  line-height: var(--line-height-body-l);
  margin: 0;
  flex-grow: 1;
}`);

    return styles.join('\n\n');
  }

  private generateCardsPatternStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const itemFields = analysis.contentStructure.itemFields || [];
    
    const styles = [];

    // Container wrapper
    styles.push(`/* Container wrapper */
.${blockName}-container {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: 0 var(--grid-gutter);
}`);

    // Content grid
    styles.push(`/* Content grid */
.${blockName}-content {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
}`);

    // Individual card styling
    const hasIconField = itemFields.some(f => f.name.includes('icon') || f.name.includes('image'));
    const cardLayout = hasIconField ? 'row' : 'column';
    
    styles.push(`/* Individual card styling */
.${blockName}-card {
  grid-column: span var(--grid-columns);
  background: var(--surface-white);
  border: 1px solid var(--border-tertiary);
  padding: var(--spacing-l);
  display: flex;
  flex-direction: ${cardLayout};
  gap: var(--spacing-m);
  align-items: ${cardLayout === 'row' ? 'flex-start' : 'center'};
  border-radius: 14px;
  ${cardLayout === 'column' ? 'text-align: center;' : ''}
}`);

    // Image/icon field styling
    const imageFields = itemFields.filter(f => f.component === 'reference');
    imageFields.forEach(field => {
      const isIcon = field.name.includes('icon');
      const size = isIcon ? '48px' : '200px';
      
      styles.push(`/* ${field.label || field.name} styling */
.${blockName}-${field.name} {
  width: ${size};
  height: ${size};
  flex-shrink: 0;
  display: block;
}

.${blockName}-${field.name} img {
  width: 100%;
  height: 100%;
  object-fit: ${isIcon ? 'contain' : 'cover'};
}`);
    });

    // Text container (if there are text fields)
    const textFields = itemFields.filter(f => f.component !== 'reference');
    if (textFields.length > 0) {
      styles.push(`/* Text container */
.${blockName}-card-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex-grow: 1;
}`);

      // Text field styling 
      textFields.forEach(field => {
        const isHeading = field.name.includes('heading');
        const tag = isHeading ? 'h4' : 'p';
        
        styles.push(`/* ${field.label || field.name} styling */
.${blockName}-card-text ${tag} {
  color: var(--text-secondary);
  margin: 0;
  ${isHeading ? `
  font-size: var(--font-size-heading-xs);
  line-height: var(--line-height-heading-xs, 1.5);
  font-weight: var(--font-weight-medium, 500);` : `
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-body-s, 1.43);`}
}`);
      });
    }

    return styles.join('\n\n');
  }

  private generateCarouselPatternStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const itemFields = analysis.contentStructure.itemFields || [];
    
    const styles = [];

    // Main carousel container
    styles.push(`/* Carousel slides container */
.${blockName} {
  padding: calc(var(--spacing-xl) + 60px) 0 var(--spacing-xl) 0;
  overflow: hidden;
}

.${blockName}-slides-container {
  position: relative;
  max-width: var(--grid-max-width);
  margin: 0 auto;
}

.${blockName}-slides {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: var(--spacing-s);
  scroll-behavior: smooth;
  overflow: scroll visible;
  padding: 0 var(--grid-margin);
  align-items: end;
}

.${blockName}-slides::-webkit-scrollbar {
  display: none;
}`);

    // Individual slide styling
    styles.push(`/* Individual slide */
.${blockName}-slide {
  flex: 0 0 350px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  opacity: 0.6;
  cursor: pointer;
}

.${blockName}-slide.active {
  flex: 0 0 450px;
  opacity: 1;
}`);

    // Image field styling
    const imageField = itemFields.find(f => f.component === 'reference');
    if (imageField) {
      styles.push(`/* Slide image */
.${blockName}-slide-image {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 0;
  background-color: var(--surface-white);
}

.${blockName}-slide-image picture {
  width: 100%;
  height: 100%;
  display: block;
}

.${blockName}-slide-image picture > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}`);
    }

    // Content styling
    styles.push(`/* Slide content */
.${blockName}-slide-content {
  padding: var(--spacing-xs) 0 0 0;
  margin: 0;
  width: 100%;
  color: var(--text-color);
  position: relative;
  z-index: 1;
}

.${blockName}-slide-content p {
  font-family: var(--body-font-family);
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-body);
  line-height: var(--line-height-body-xs);
  margin: 0;
  padding: 0;
  color: var(--text-color);
}`);

    // Navigation buttons
    styles.push(`/* Navigation buttons */
.${blockName}-navigation-buttons {
  position: absolute;
  top: -60px;
  right: 0;
  display: flex;
  gap: var(--spacing-xs);
  z-index: 10;
}

.${blockName}-navigation-buttons button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-primary);
  background: var(--surface-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.${blockName}-navigation-buttons button:hover {
  background: var(--surface-hover);
}

.${blockName}-navigation-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}`);

    return styles.join('\n\n');
  }

  private generateSingleItemStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    return `/* Content styling */
.${blockName} .content {
  max-width: var(--grid-max-width);
  margin: 0 auto;
}

/* Heading styling */
.${blockName} .heading {
  color: var(--text-primary);
  margin-bottom: var(--spacing-l);
}

/* Text content styling */
.${blockName} .text-content {
  color: var(--text-primary);
  font-family: var(--body-font-family);
  font-weight: var(--font-weight-regular);
  font-size: var(--font-size-body-l);
  line-height: var(--line-height-body-l);
}`;
  }

  private generateButtonStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    
    return `/* CTA buttons container */
.${blockName} .ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  margin-top: auto;
}

/* Button base styles */
.${blockName} .ctas .button {
  font-family: var(--body-font-family);
  font-weight: var(--font-weight-button);
  font-size: var(--font-size-button-m);
  line-height: var(--line-height-button-m);
  padding: 16px 24px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

/* Primary button */
.${blockName} .ctas .button-primary {
  background-color: var(--button-primary);
  color: var(--text-on-color);
  border: 2px solid var(--button-primary);
}

.${blockName} .ctas .button-primary:hover {
  background-color: var(--button-primary-hover, var(--button-primary));
  border-color: var(--button-primary-hover, var(--button-primary));
}

/* Secondary button */
.${blockName} .ctas .button-secondary {
  background-color: transparent;
  color: var(--button-primary);
  border: 2px solid var(--button-primary);
}

.${blockName} .ctas .button-secondary:hover {
  background-color: var(--button-primary);
  color: var(--text-on-color);
}`;
  }

  private generateEmptyStateStyles(blockName: string): string {
    return `/* Empty state placeholder styling for Universal Editor */
.${blockName} [data-placeholder]::before {
  content: attr(data-placeholder);
  color: #999;
  font-style: italic;
  opacity: 0.7;
}

.${blockName} .empty-cta[data-placeholder] {
  background-color: transparent;
  border: 2px dashed #ccc;
  color: #999;
  cursor: default;
}

.${blockName} .empty-cta[data-placeholder]:hover {
  background-color: transparent;
  border-color: #999;
  color: #666;
}

.${blockName} [data-placeholder]:empty::before {
  content: attr(data-placeholder);
  display: inline-block;
  min-height: 1em;
  min-width: 100px;
}`;
  }

  private generateResponsiveStyles(analysis: BlockAnalysis): string {
    const blockName = analysis.blockName;
    const jsPattern = analysis.contentStructure.jsPattern || 'decorated';
    
    if (analysis.blockType === 'single') {
      return '';
    }

    // Use carousel pattern responsive styles if jsPattern is 'carousel'
    if (jsPattern === 'carousel') {
      return this.generateCarouselResponsiveStyles(blockName);
    }

    // Use cards pattern responsive styles if jsPattern is 'cards'
    if (jsPattern === 'cards') {
      return this.generateCardsResponsiveStyles(blockName);
    }

    return `/* Tablet breakpoint (768px+) */
@media (width >= 768px) {
  .${blockName} .item {
    grid-column: span 4; /* Half width on tablet */
  }
}

/* Desktop breakpoint (900px+) */
@media (width >= 900px) {
  .${blockName} .item {
    grid-column: span 6; /* Half width on desktop (2 columns) */
  }
  
  /* Container heading spans appropriate columns */
  .${blockName} .container-heading {
    grid-column: span 8;
  }
}`;
  }

  private generateCardsResponsiveStyles(blockName: string): string {
    return `/* Tablet breakpoint (768px+) - 2 columns */
@media (width >= 768px) {
  .${blockName}-container {
    max-width: var(--grid-max-width-tablet);
    padding: 0 var(--grid-gutter-tablet);
  }
  
  .${blockName}-content {
    gap: var(--grid-gutter-tablet);
  }
  
  .${blockName}-card {
    grid-column: span calc(var(--grid-columns-tablet) / 2);
  }
}

/* Desktop breakpoint (900px+) - 2 columns */
@media (width >= 900px) {
  .${blockName}-container {
    max-width: var(--grid-max-width-desktop);
    padding: 0 var(--grid-gutter-desktop);
  }
  
  .${blockName}-content {
    grid-template-columns: repeat(var(--grid-columns-desktop), 1fr);
    gap: var(--grid-gutter-desktop);
  }
  
  .${blockName}-card {
    grid-column: span 6;
  }
}`;
  }

  private generateCarouselResponsiveStyles(blockName: string): string {
    return `/* Tablet breakpoint (768px+) */
@media (width >= 768px) {
  .${blockName}-slides {
    padding: 0 var(--grid-margin-tablet);
  }
  
  .${blockName}-slide {
    flex: 0 0 400px;
  }
  
  .${blockName}-slide.active {
    flex: 0 0 500px;
  }
}

/* Desktop breakpoint (900px+) */
@media (width >= 900px) {
  .${blockName}-slides {
    padding: 0 var(--grid-margin-desktop);
  }
  
  .${blockName}-slide {
    flex: 0 0 350px;
  }
  
  .${blockName}-slide.active {
    flex: 0 0 450px;
  }
}`;
  }

  private hasButtons(analysis: BlockAnalysis): boolean {
    const hasInteractionButtons = (analysis.interactions?.ctaButtons?.length ?? 0) > 0;
    const hasFieldButtons = analysis.contentStructure.itemFields && 
                           analysis.contentStructure.itemFields.some(f => f.name.includes('Cta'));
    return hasInteractionButtons || !!hasFieldButtons;
  }

  private capitalize(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}