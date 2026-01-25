import { Helmet } from 'react-helmet';

export default function GoogleAnalytics() {
  return (
    <Helmet>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-6DSQKNVFMB"></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-6DSQKNVFMB');
        `}
      </script>
    </Helmet>
  );
}