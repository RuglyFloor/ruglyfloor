import { useEffect } from 'react';

export default function Robots() {
  useEffect(() => {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://www.ruglyfloor.com/sitemap.xml`;

    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.location.replace(url);
  }, []);

  return null;
}