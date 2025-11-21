import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Helper function to identify configuration values
 */
function isConfigurationValue(text) {
  const configValues = ['dark', 'light', 'centered', 'compact'];
  return configValues.includes(text.toLowerCase());
}

/**
 * Decorates a feature-lists item
 * @param {Element} item The item element from Universal Editor
 */
function decorateItem(item) {
  const cells = [...item.children];
  if (cells.length < 2) return;

  const headingCell = cells[0];
  const richContentCell = cells[1];

  // Extract heading
  const headingText = headingCell.textContent.trim();

  // Extract richContent - handle various formats
  const richContentElement = richContentCell.querySelector('ul, ol') || richContentCell;
  const richContentItems = [];

  if (richContentElement.tagName === 'UL' || richContentElement.tagName === 'OL') {
    // Already a list - extract items
    const liElements = richContentElement.querySelectorAll('li');
    liElements.forEach((li) => {
      const itemText = li.textContent.trim();
      if (itemText) richContentItems.push(itemText);
    });
  } else {
    // Plain text - parse bullet points
    const textContent = richContentElement.textContent.trim();
    if (textContent.includes('•')) {
      const bulletItems = textContent.split('•')
        .map((bulletItem) => bulletItem.trim())
        .filter((bulletItem) => bulletItem);
      richContentItems.push(...bulletItems);
    } else if (textContent.includes('\n')) {
      const lineItems = textContent.split('\n')
        .map((lineItem) => lineItem.trim())
        .filter((lineItem) => lineItem);
      richContentItems.push(...lineItems);
    } else if (textContent) {
      richContentItems.push(textContent);
    }
  }

  // Create the decorated structure
  item.innerHTML = '';
  item.className = 'feature-lists-item';

  // Create heading element
  if (headingText) {
    const headingElement = document.createElement('h3');
    headingElement.className = 'heading';
    headingElement.textContent = headingText;

    // Preserve UE instrumentation
    moveInstrumentation(headingCell, headingElement);
    item.appendChild(headingElement);
  }

  // Create richContent list
  if (richContentItems.length > 0) {
    const richContentContainer = document.createElement('ul');
    richContentContainer.className = 'rich-content';

    richContentItems.forEach((itemText) => {
      const listItem = document.createElement('li');
      listItem.textContent = itemText;
      richContentContainer.appendChild(listItem);
    });

    // Preserve UE instrumentation
    moveInstrumentation(richContentCell, richContentContainer);
    item.appendChild(richContentContainer);
  }
}

/**
 * Decorates the feature-lists block
 * @param {Element} block The feature-lists block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  let containerHeading = '';
  let containerIcon = null;
  const items = [];

  // First pass: identify container fields and items by content type
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const firstCell = cells[0];
    const firstCellText = firstCell.textContent.trim();
    const img = firstCell.querySelector('img');

    // Handle configuration values (variants)
    if (isConfigurationValue(firstCellText)) {
      block.classList.add(firstCellText.toLowerCase());
      row.remove();
      return;
    }

    // Handle container icon - single cell with image
    if (cells.length === 1 && img && img.src && !containerIcon) {
      containerIcon = img;
      row.remove();
      return;
    }

    // Handle container heading - single cell with text, no image
    if (cells.length === 1 && firstCellText && !img && !containerHeading) {
      containerHeading = firstCellText;
      row.remove();
      return;
    }

    // Handle items - 2 cells: heading + richContent
    if (cells.length === 2) {
      const headingCell = cells[0];
      const heading = headingCell.textContent.trim();

      if (heading) {
        // This is a feature-lists-item - keep it for processing
        items.push(row);
        return;
      }
    }

    // Remove empty or unrecognized rows
    row.remove();
  });

  // Clear the block to rebuild structure
  block.innerHTML = '';

  // Build container header with icon and heading
  if (containerIcon || containerHeading) {
    const containerElement = document.createElement('div');
    containerElement.className = 'container-content';

    if (containerIcon) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'icon';

      // Create optimized picture with fixed size
      const picture = createOptimizedPicture(
        containerIcon.src,
        containerIcon.alt || '',
        false,
        [{ width: '20' }],
      );
      iconWrapper.appendChild(picture);
      containerElement.appendChild(iconWrapper);
    }

    if (containerHeading) {
      const headingElement = document.createElement('p');
      headingElement.className = 'heading';
      headingElement.textContent = containerHeading;
      containerElement.appendChild(headingElement);
    }

    block.appendChild(containerElement);
  }

  // Create items container
  if (items.length > 0) {
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'feature-lists-items-container';

    // Decorate each item and move to container
    items.forEach((item) => {
      decorateItem(item);
      itemsContainer.appendChild(item);
    });

    block.appendChild(itemsContainer);
  } else {
    // Add empty state for Universal Editor
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Add feature items...';
    block.appendChild(emptyState);
  }
}
