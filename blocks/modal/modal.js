import { loadFragment } from '../fragment/fragment.js';
import {
  buildBlock, decorateBlock, loadBlock, loadCSS,
} from '../../scripts/aem.js';

/*
  This is not a traditional block, so there is no decorate function.
  Instead, links to a /modals/ path are automatically transformed into a modal.
  Other blocks can also use the createModal() and openModal() functions.
*/

export async function createModal(contentNodes) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);
  const dialog = document.createElement('dialog');
  const dialogContent = document.createElement('div');
  dialogContent.classList.add('modal-content');
  dialogContent.append(...contentNodes);
  dialog.append(dialogContent);

  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.type = 'button';
  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3473 11.4027C12.8103 10.8658 11.9397 10.8658 11.4027 11.4027C10.8658 11.9397 10.8658 12.8103 11.4027 13.3473L20.0555 22L11.4027 30.6527C10.8658 31.1897 10.8658 32.0603 11.4027 32.5973C11.9397 33.1342 12.8103 33.1342 13.3473 32.5973L22 23.9445L30.6527 32.5973C31.1897 33.1342 32.0603 33.1342 32.5973 32.5973C33.1342 32.0603 33.1342 31.1897 32.5973 30.6527L23.9445 22L32.5973 13.3473C33.1342 12.8103 33.1342 11.9397 32.5973 11.4027C32.0603 10.8658 31.1897 10.8658 30.6527 11.4027L22 20.0555L13.3473 11.4027Z" fill="#0D0D0C"/>
    </svg>
  `;
  closeButton.addEventListener('click', () => dialog.close());
  dialog.prepend(closeButton);

  const block = buildBlock('modal', '');
  document.querySelector('main').append(block);
  decorateBlock(block);
  await loadBlock(block);

  // close on click outside the dialog
  dialog.addEventListener('click', (e) => {
    const {
      left, right, top, bottom,
    } = dialog.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < left || clientX > right || clientY < top || clientY > bottom) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    block.remove();
  });

  block.innerHTML = '';
  block.append(dialog);

  return {
    block,
    showModal: () => {
      dialog.showModal();
      // reset scroll position
      setTimeout(() => { dialogContent.scrollTop = 0; }, 0);
      document.body.classList.add('modal-open');
    },
  };
}

export async function openModal(fragmentUrl) {
  const path = fragmentUrl.startsWith('http')
    ? new URL(fragmentUrl, window.location).pathname
    : fragmentUrl;

  const fragment = await loadFragment(path);
  const { showModal } = await createModal(fragment.childNodes);
  showModal();
}
