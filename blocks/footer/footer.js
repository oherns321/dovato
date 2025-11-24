/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Create footer structure matching dovato.com
  block.textContent = '';

  const footerContainer = document.createElement('div');
  footerContainer.className = 'footer-container container-content';

  // Top Navigation Section
  const topNav = document.createElement('nav');
  topNav.className = 'footer-top-nav';
  topNav.setAttribute('aria-label', 'Footer navigation');

  const topNavList = document.createElement('ul');
  const topNavItems = [
    { label: 'Home', path: '/' },
    { label: 'The DOVATO Difference', path: '/what-is-dovato' },
    { label: 'People Who Switched', path: '/real-stories' },
    { label: 'Talk to Your Doctor', path: '/talk-to-your-doctor-about-dovato' },
    { label: 'Risks & Side Effects', path: '/dovato-side-effects' },
    { label: 'Support & Resources', path: '/dovato-resources' },
    { label: 'Living With HIV', path: '/living-with-hiv' },
  ];

  topNavItems.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.path;
    a.textContent = item.label;
    li.appendChild(a);
    topNavList.appendChild(li);
  });

  topNav.appendChild(topNavList);
  footerContainer.appendChild(topNav);

  // Middle Section - Logo and Legal Info
  const middleSection = document.createElement('div');
  middleSection.className = 'footer-middle';

  // Logo column
  const logoColumn = document.createElement('div');
  logoColumn.className = 'footer-logo-column';

  const logoLink = document.createElement('a');
  logoLink.href = 'https://viivhealthcare.com/en-us/';
  logoLink.setAttribute('target', '_blank');
  logoLink.setAttribute('rel', 'noopener noreferrer');
  logoLink.setAttribute('aria-label', 'ViiV Healthcare');

  const logoImg = document.createElement('img');
  logoImg.src = '/icons/logo-viiv.svg';
  logoImg.alt = 'ViiV Healthcare logo';
  logoLink.appendChild(logoImg);
  logoColumn.appendChild(logoLink);

  middleSection.appendChild(logoColumn);

  // Legal text columns
  const legalColumns = document.createElement('div');
  legalColumns.className = 'footer-legal-columns';

  const legalColumn1 = document.createElement('div');
  legalColumn1.className = 'footer-legal-column';
  const legalText1 = document.createElement('p');
  legalText1.innerHTML = 'This website is funded and developed by <span class="no-wrap">ViiV Healthcare.</span> This site is intended for <span class="no-wrap">US residents</span> only.';
  legalColumn1.appendChild(legalText1);

  const legalColumn2 = document.createElement('div');
  legalColumn2.className = 'footer-legal-column';
  const legalText2 = document.createElement('p');
  const currentYear = new Date().getFullYear();
  legalText2.innerHTML = `<span class="no-wrap">©${currentYear} ViiV Healthcare or licensor.<br>PMUS-DLLWCNT240084 March 2025</span><br>Produced in USA.`;
  legalColumn2.appendChild(legalText2);

  legalColumns.appendChild(legalColumn1);
  legalColumns.appendChild(legalColumn2);
  middleSection.appendChild(legalColumns);

  footerContainer.appendChild(middleSection);

  // Bottom Navigation Section
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'footer-bottom-nav';
  bottomNav.setAttribute('aria-label', 'Legal and privacy navigation');

  const bottomNavList = document.createElement('ul');
  const bottomNavItems = [
    { label: 'Terms of Use', path: 'https://viivhealthcare.com/en-us/terms-of-use/' },
    { label: 'Privacy Notice', path: 'https://viivhealthcare.com/en-us/privacy-notice/' },
    { label: 'Consumer Health Privacy', path: 'https://viivhealthcare.com/en-us/consumer-health-privacy/' },
    { label: 'Interest-based Ads', path: 'https://viivhealthcare.com/en-us/about-our-ads/' },
    { label: 'Medicine Savings', path: 'https://www.viivconnect.com/' },
    { label: 'Contact Us', path: 'https://contactus.viivhealthcare.com/consumer-contact-form/' },
    { label: 'Unsubscribe', path: 'https://privacyportal-de.onetrust.com/webform/0a84bb21-f26f-4cf7-8095-11a164a1de5b/0999a50d-0d93-4b13-a117-f3bdff9ebbc8' },
  ];

  bottomNavItems.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.path;
    a.textContent = item.label;
    if (item.path.startsWith('http')) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
    li.appendChild(a);
    bottomNavList.appendChild(li);
  });

  bottomNav.appendChild(bottomNavList);
  footerContainer.appendChild(bottomNav);

  block.appendChild(footerContainer);
}
