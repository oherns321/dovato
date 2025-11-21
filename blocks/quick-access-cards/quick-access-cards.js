import { moveInstrumentation } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

// Extract card data from a table row - follows model field order
function extractCardData(element, row) {
  const cardData = {
    cardIcon: null,
    cardIconAlt: '',
    cardHeading: '',
    cardBody: '',
  };

  const cells = [...row.children];

  // Process cells in order to match JSON model field sequence
  // Model order: icon, heading, body
  if (cells[0]) {
    const img = cells[0].querySelector('img');
    if (img && img.src) {
      cardData.cardIcon = img;
      cardData.cardIconAlt = img.alt || '';
    }
  }

  if (cells[1]) {
    const headingContent = cells[1].innerHTML.trim();
    if (headingContent) {
      cardData.cardHeading = headingContent;
    }
  }

  if (cells[2]) {
    const bodyContent = cells[2].innerHTML.trim();
    if (bodyContent) {
      cardData.cardBody = bodyContent;
    }
  }

  return cardData;
}

// Create a card element
function createCardElement(cardData, index, originalRow = null) {
  const cardContainer = document.createElement('div');
  cardContainer.className = 'quick-access-card';

  // Move Universal Editor instrumentation to preserve editing capabilities
  if (originalRow) {
    moveInstrumentation(originalRow, cardContainer);
  }

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'quick-access-card-icon';

  if (cardData.cardIcon) {
    // Create optimized picture element for icons
    const optimizedPic = createOptimizedPicture(
      cardData.cardIcon.src,
      cardData.cardIconAlt || cardData.cardHeading || 'Quick access icon',
      false,
      [{ width: '48' }],
    );
    iconContainer.appendChild(optimizedPic);
  } else {
    // Empty placeholder for Universal Editor
    iconContainer.setAttribute('data-placeholder', 'Add icon...');
  }

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'quick-access-card-text';

  // Create heading element
  const headingElement = document.createElement('h4');
  if (cardData.cardHeading) {
    headingElement.innerHTML = cardData.cardHeading;
  } else {
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add heading...');
  }

  // Create body element
  const bodyElement = document.createElement('p');
  if (cardData.cardBody) {
    bodyElement.innerHTML = cardData.cardBody;
  } else {
    bodyElement.innerHTML = '';
    bodyElement.setAttribute('data-placeholder', 'Add body text...');
  }

  textContainer.appendChild(headingElement);
  textContainer.appendChild(bodyElement);

  cardContainer.appendChild(iconContainer);
  cardContainer.appendChild(textContainer);

  return cardContainer;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'quick-access-cards-container';

  // Create content container
  const content = document.createElement('div');
  content.className = 'quick-access-cards-content';

  // Process all rows as child items
  rows.forEach((row, index) => {
    const itemData = extractCardData(row, row);
    const itemElement = createCardElement(itemData, index, row);
    content.appendChild(itemElement);
  });

  container.appendChild(content);

  // Clear original content and add the new container
  block.innerHTML = '';
  block.appendChild(container);
}
