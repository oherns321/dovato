/*
 * Accordion Block
 * Recreate an accordion
 * Adapted for Adobe Code Kit
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Check if first row is the heading (single cell with text content, no richtext formatting)
  let startIndex = 0;
  if (rows.length > 0) {
    const firstRow = rows[0];
    const cells = [...firstRow.children];

    // If first row has only one cell, it's the heading
    if (cells.length === 1) {
      const cell = cells[0];
      const textContent = cell.textContent.trim();

      // Check if it's a simple text (heading) rather than accordion content
      // Accordion items will have 2 cells (label + body)
      if (textContent && !cell.querySelector('p, h1, h2, h3, h4, h5, h6')) {
        // This is the heading - extract and create heading element
        const heading = document.createElement('h2');
        heading.className = 'accordion-heading';
        heading.textContent = textContent;

        // Insert heading before the first row
        block.insertBefore(heading, firstRow);

        // Remove the heading row
        firstRow.remove();
        startIndex = 1;
      } else if (textContent) {
        // Single cell with formatted content - treat as heading
        const heading = document.createElement('div');
        heading.className = 'accordion-heading';
        heading.append(...cell.childNodes);

        moveInstrumentation(firstRow, heading);
        block.insertBefore(heading, firstRow);
        firstRow.remove();
        startIndex = 1;
      }
    }
  }

  // Process accordion items
  rows.slice(startIndex).forEach((row) => {
    const cells = [...row.children];

    // Skip if not a proper accordion item (needs 2 cells)
    if (cells.length < 2) return;

    // Extract label from first cell
    const labelCell = cells[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';

    // Get the nested content from Universal Editor structure
    const labelContent = labelCell.querySelector(':scope > div');
    if (labelContent) {
      summary.append(...labelContent.childNodes);
    } else {
      summary.append(...labelCell.childNodes);
    }

    // Extract body from second cell
    const bodyCell = cells[1];
    const body = document.createElement('div');
    body.className = 'accordion-item-body';

    // Get the nested content from Universal Editor structure
    const bodyContent = bodyCell.querySelector(':scope > div');
    if (bodyContent) {
      body.append(...bodyContent.childNodes);
    } else {
      body.append(...bodyCell.childNodes);
    }

    // Create details element
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);

    // Preserve Universal Editor instrumentation
    moveInstrumentation(row, details);

    // Replace the row with the details element
    row.replaceWith(details);
  });

  // Handle "first-open" style option
  if (block.classList.contains('first-open')) {
    const firstItem = block.querySelector('.accordion-item');
    if (firstItem) {
      firstItem.setAttribute('open', '');
    }
  }
}
