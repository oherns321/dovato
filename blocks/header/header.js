import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 992px)');

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > a');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';
  breadcrumbs.ariaLabel = 'Breadcrumb';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Create header structure matching dovato.com - stacked sections
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'header-wrapper container-content';

  // ===== MAIN ROW CONTAINER (2 columns) =====
  const mainRow = document.createElement('div');
  mainRow.className = 'header-main-row';

  // ===== LEFT COLUMN: Logo =====
  const leftColumn = document.createElement('div');
  leftColumn.className = 'header-left-column';

  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';

  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.setAttribute('aria-label', 'DOVATO Home');

  const logoImg = document.createElement('img');
  logoImg.src = 'https://main--dovato--oherns321.aem.live/icons/logo-dovato-dt.svg';
  logoImg.alt = 'DOVATO (dolutegravir/lamivudine) logo';
  logoImg.className = 'logo-desktop';

  const logoImgMobile = document.createElement('img');
  logoImgMobile.src = 'https://main--dovato--oherns321.aem.live/icons/Logo_Dovato_m.svg';
  logoImgMobile.alt = 'DOVATO (dolutegravir/lamivudine) logo';
  logoImgMobile.className = 'logo-mobile';

  logoLink.appendChild(logoImg);
  logoLink.appendChild(logoImgMobile);
  navBrand.appendChild(logoLink);
  leftColumn.appendChild(navBrand);

  // ===== RIGHT COLUMN: Utility Bar + Main Nav =====
  const rightColumn = document.createElement('div');
  rightColumn.className = 'header-right-column';

  // Row 1: Utility Bar
  const utilityBarRow = document.createElement('div');
  utilityBarRow.className = 'utility-bar-row';

  const utilityBar = document.createElement('div');
  utilityBar.className = 'utility-bar';

  const utilityList = document.createElement('ul');
  const utilityItems = [
    { label: 'Full Prescribing Info with Boxed Warning', path: 'https://gskpro.com/content/dam/global/hcpportal/en_US/Prescribing_Information/Dovato/pdf/DOVATO-PI-PIL.PDF#page=1' },
    { label: 'Patient Info', path: 'https://gskpro.com/content/dam/global/hcpportal/en_US/Prescribing_Information/Dovato/pdf/DOVATO-PI-PIL.PDF#page=36' },
    { label: 'For US Healthcare Professionals', path: 'https://dovatohcp.com/' },
    { label: 'En Español', path: 'https://www.es.dovato.com/' },
  ];

  utilityItems.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.path;
    a.textContent = item.label;
    if (item.path.startsWith('http')) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
    li.appendChild(a);
    utilityList.appendChild(li);
  });

  utilityBar.appendChild(utilityList);
  utilityBarRow.appendChild(utilityBar);

  // Row 2: Main Navigation + Hamburger
  const mainNavRow = document.createElement('div');
  mainNavRow.className = 'main-nav-row';

  // Navigation sections with dropdowns
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';

  const navList = document.createElement('ul');

  const navItems = [
    {
      label: 'The DOVATO<br class="hide-mobile hide-tablet"/>Difference',
      path: '/what-is-dovato',
      submenu: [
        { label: 'Clinical Studies', path: '/what-is-dovato/clinical-studies' },
      ],
    },
    { label: 'People<br class="hide-mobile hide-tablet"/>Who Switched', path: '/real-stories' },
    { label: 'Talk to<br class="hide-mobile hide-tablet"/>Your Doctor', path: '/talk-to-your-doctor-about-dovato' },
    { label: 'Risks &<br class="hide-mobile hide-tablet"/>Side Effects', path: '/dovato-side-effects' },
    {
      label: 'Support &<br class="hide-mobile hide-tablet"/>Resources',
      path: '/dovato-resources',
      submenu: [
        { label: 'FAQs', path: '/dovato-resources/faqs' },
      ],
    },
    {
      label: 'Living<br class="hide-mobile hide-tablet"/>With HIV',
      path: '/living-with-hiv',
      submenu: [
        { label: 'New to Treatment', path: '/living-with-hiv/new-to-treatment' },
      ],
    },
  ];

  navItems.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.className = 'nav-item';

    const link = document.createElement('a');
    link.href = item.path;
    link.innerHTML = item.label;
    link.className = 'nav-link';
    listItem.appendChild(link);

    if (item.submenu) {
      listItem.classList.add('has-dropdown');

      // Add arrow icon for dropdown toggle
      const arrow = document.createElement('span');
      arrow.className = 'dropdown-arrow';
      arrow.setAttribute('role', 'button');
      arrow.setAttribute('aria-label', 'Toggle submenu');
      arrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close other open dropdowns
        navList.querySelectorAll('.nav-item.dropdown-active').forEach((openItem) => {
          if (openItem !== listItem) {
            openItem.classList.remove('dropdown-active');
          }
        });

        // Toggle this dropdown
        listItem.classList.toggle('dropdown-active');
      });
      listItem.appendChild(arrow);

      const dropdown = document.createElement('ul');
      dropdown.className = 'nav-dropdown';

      item.submenu.forEach((subItem) => {
        const subListItem = document.createElement('li');
        const subLink = document.createElement('a');
        subLink.href = subItem.path;
        subLink.textContent = subItem.label;
        subListItem.appendChild(subLink);
        dropdown.appendChild(subListItem);
      });

      listItem.appendChild(dropdown);
    }

    navList.appendChild(listItem);
  });

  navSections.appendChild(navList);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!navSections.contains(e.target)) {
      navList.querySelectorAll('.nav-item.dropdown-active').forEach((openItem) => {
        openItem.classList.remove('dropdown-active');
      });
    }
  });

  // Mobile hamburger
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));

  // Assemble main navigation row
  mainNavRow.appendChild(hamburger);
  mainNavRow.appendChild(navSections);

  // Assemble right column (utility bar + main nav)
  rightColumn.appendChild(utilityBarRow);
  rightColumn.appendChild(mainNavRow);

  // Assemble main row (left column + right column)
  mainRow.appendChild(leftColumn);
  mainRow.appendChild(rightColumn);

  // Assemble complete header
  nav.appendChild(mainRow);
  nav.setAttribute('aria-expanded', 'false');

  // Mobile behavior
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
