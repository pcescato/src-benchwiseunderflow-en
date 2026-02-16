import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

export default function initPhotoSwipe() {
  const lightbox = new PhotoSwipeLightbox({
    gallery: document.body,
    children: 'a.article-gallery-item',
    pswpModule: PhotoSwipe,
    showHideAnimationType: 'fade',

    // paramètres personnalisés
    initialZoomLevel: 'fit',   // image ajustée à la fenêtre
    secondaryZoomLevel: 1.5,   // zoom modéré au deuxième clic
    maxZoomLevel: 2,           // limite le zoom max

    caption: ({ element }) =>
      element.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ||
      element.querySelector('img')?.alt ||
      '',
  });

  lightbox.init();
}
