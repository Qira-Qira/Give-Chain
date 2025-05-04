import React from 'react';
import type { AppProps } from 'next/app';

// Import global styles if needed
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
