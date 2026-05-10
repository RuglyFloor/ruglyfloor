import { useEffect } from 'react';

/**
 * Tracks cart abandonment: fires when a user has added to cart
 * but hasn't reached /Success within the session.
 *
 * Call this hook on the Cart page.
 * The event is logged to console AND sent to analytics if available.
 */
export function useCartAbandonment(cart) {
  useEffect(() => {
    if (!cart || cart.length === 0) return;

    // Mark that user has viewed the cart with items
    sessionStorage.setItem('rugly_cart_viewed', Date.now().toString());
    sessionStorage.setItem('rugly_cart_value', cart.reduce((s, i) => s + i.price, 0).toString());
    sessionStorage.removeItem('rugly_reached_success');

    const handleUnload = () => {
      const cartViewed = sessionStorage.getItem('rugly_cart_viewed');
      const reachedSuccess = sessionStorage.getItem('rugly_reached_success');

      if (cartViewed && !reachedSuccess) {
        const cartValue = sessionStorage.getItem('rugly_cart_value') || '0';
        const timeOnCart = Math.round((Date.now() - parseInt(cartViewed)) / 1000);

        // Log for debugging
        console.warn('[Rugly CRO] Cart Abandonment Event', {
          cartValue: parseFloat(cartValue),
          timeOnCartSeconds: timeOnCart,
          timestamp: new Date().toISOString(),
          items: JSON.parse(localStorage.getItem('rugly_cart') || '[]').map(i => ({
            name: i.name,
            price: i.price,
            tier: i.qualityTier,
          })),
        });

        // Google Analytics 4 event (fires if gtag is loaded)
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'cart_abandonment', {
            currency: 'USD',
            value: parseFloat(cartValue),
            time_on_cart_seconds: timeOnCart,
          });
        }

        // Facebook Pixel (fires if fbq is loaded)
        if (typeof window.fbq === 'function') {
          window.fbq('trackCustom', 'CartAbandonment', {
            value: parseFloat(cartValue),
            currency: 'USD',
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [cart]);
}

/** Call this on the Success page to mark conversion */
export function markCartConversion() {
  sessionStorage.setItem('rugly_reached_success', '1');
}