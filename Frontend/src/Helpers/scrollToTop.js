import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    try {
      main.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      // for older browser
      main.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
