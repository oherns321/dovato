/* eslint-disable no-tabs */
import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const aemauthorurl = 'https://author-p7906-e1488805.adobeaemcloud.com';
  const aempublishurl = 'https://publish-p7906-e1488805.adobeaemcloud.com';
  const persistedquery = '/graphql/execute.json/dovato-demo/getISI';
  const contentPath = '/content/dam/dovato-demo/dovato';
  const variationname = block
    .querySelector(':scope div:nth-child(2) > div')
    ?.textContent?.trim()
    ?.toLowerCase()
    ?.replace(' ', '_') || 'master';
  block.innerHTML = '';
  const isAuthor = isAuthorEnvironment();
  const url = window?.location?.origin?.includes('author')
    ? `${aemauthorurl}${persistedquery};isiTextPath=${contentPath};variation=${variationname};ts=${
      Math.random() * 1000
    }`
    : `${aempublishurl}${persistedquery};isiTextPath=${contentPath};variation=${variationname};ts=${
      Math.random() * 1000
    }`;
  const options = { credentials: 'include' };
  const cfReq = await fetch(url, options)
    .then((response) => response.json())
    .then((contentfragment) => {
      let isi = '';
      if (contentfragment.data) {
        isi = contentfragment?.data?.isiTextList?.items[0];
      }
      return isi;
    });
  const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationname}`;
  block.setAttribute('data-aue-type', 'container');

  block.innerHTML = `
  <div class='isi-content block' data-aue-resource=${itemId} data-aue-label="isi content fragment" data-aue-type="reference" data-aue-filter="cf">
		<div class='isi-detail'>
          <p data-aue-prop="isi_text" data-aue-label="isi_text" data-aue-type="richtext">${cfReq?.isi_text?.html}</p>
      </div>
  </div>
	`;

  if (!isAuthor) {
    moveInstrumentation(block, null);
    block.querySelectorAll('*').forEach((elem) => moveInstrumentation(elem, null));
  }
}
