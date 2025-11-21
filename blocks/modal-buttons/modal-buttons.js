import { createModal, openModal } from '../modal/modal.js';

export default async function decorate(block) {
  const rows = [...block.children];

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'modal-buttons-container';

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 0) return;

    const cell = cells[0];
    const link = cell.querySelector('a');

    if (link) {
      // Convert link to button
      const button = document.createElement('button');
      button.className = 'button primary cta-button';
      button.textContent = link.textContent;
      button.setAttribute('data-modal-url', link.href);

      buttonsContainer.appendChild(button);
    }
  });

  // Get all buttons
  const buttons = buttonsContainer.querySelectorAll('.cta-button');

  // First button: Opens custom modal with programmatic content
  if (buttons[0]) {
    buttons[0].addEventListener('click', async (e) => {
      e.preventDefault();

      // Create custom modal content
      const modalContent = document.createElement('div');
      modalContent.innerHTML = `
        <h2>Welcome!</h2>
        <p>This is a custom modal created programmatically.</p>
        <button class="button primary">Get Started</button>
      `;

      // Create and show the modal
      const { showModal } = await createModal([modalContent]);
      showModal();
    });
  }

  // Second button: Opens modal with fragment content from URL
  if (buttons[1]) {
    buttons[1].addEventListener('click', async (e) => {
      e.preventDefault();

      const modalUrl = buttons[1].getAttribute('data-modal-url');

      // If the URL points to a /modals/ path, use openModal
      if (modalUrl && modalUrl.includes('/modals/')) {
        await openModal(modalUrl);
      } else {
        // Fallback: create a simple info modal
        const modalContent = document.createElement('div');
        modalContent.innerHTML = `
          <h2>Fragment Modal</h2>
          <p>This button opens a modal with content from: <code>${modalUrl || 'No URL specified'}</code></p>
          <p>Update the second button's link to point to a /modals/ path to load fragment content.</p>
        `;

        const { showModal } = await createModal([modalContent]);
        showModal();
      }
    });
  }

  // Replace block content with buttons
  block.innerHTML = '';
  block.appendChild(buttonsContainer);
}
