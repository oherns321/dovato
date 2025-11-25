/* eslint-disable no-tabs */
// import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  console.log(block);
  // const aemauthorurl = 'https://author-p7906-e91530.adobeaemcloud.com';
  // const aempublishurl = 'https://publish-p7906-e91530.adobeaemcloud.com';
  // const persistedquery = '/graphql/execute.json/sibe/getISITextByPath';
  // const contentPath = '/content/dam/sibe/isi/indication-and-important-safety-information';
  // const variationname = block
  //   .querySelector(':scope div:nth-child(2) > div')
  //   ?.textContent?.trim()
  //   ?.toLowerCase()
  //   ?.replace(' ', '_') || 'master';
  // block.innerHTML = '';
  // const isAuthor = isAuthorEnvironment();
  // const url = window?.location?.origin?.includes('author')
  // eslint-disable-next-line max-len
  //   ? `${aemauthorurl}${persistedquery};isiTextPath=${contentPath};variation=${variationname};ts=${
  //     Math.random() * 1000
  //   }`
  // eslint-disable-next-line max-len
  //   : `${aempublishurl}${persistedquery};isiTextPath=${contentPath};variation=${variationname};ts=${
  //     Math.random() * 1000
  //   }`;
  // const options = { credentials: 'include' };
  // const cfReq = await fetch(url, options)
  //   .then((response) => response.json())
  //   .then((contentfragment) => {
  //     let isi = '';
  //     if (contentfragment.data) {
  //       isi = contentfragment.data.isiTextByPath.item;
  //     }
  //     return isi;
  //   });
  // const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationname}`;
  // block.setAttribute('data-aue-type', 'container');

  // block.innerHTML = `
  // <div class='isi-content block' data-aue-resource=${itemId} data-aue-label="isi content fragment" data-aue-type="reference" data-aue-filter="cf">
	// 	<div class='isi-detail'>
  //         <p data-aue-prop="ISI_Text" data-aue-label="ISI_Text" data-aue-type="richtext">${cfReq?.ISI_Text?.html}</p>
  //     </div>
  // </div>
	// `;

  // if (!isAuthor) {
  //   moveInstrumentation(block, null);
  //   block.querySelectorAll('*').forEach((elem) => moveInstrumentation(elem, null));
  // }
}
