import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML document template for web builds.
 * Sets SEO metadata, title, viewport, theme colors, and responsive resets.
 */
export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <title>Krishi Setu - Smart Precision Agriculture Platform</title>
        <meta
          name="description"
          content="Krishi Setu: Cloud-Native Precision Agriculture, AI Leaf Disease Diagnostics, NPK Soil Advisory, and Mandi Trade Linkage Platform for Farmers."
        />
        <meta name="theme-color" content="#134426" />
        <link rel="icon" type="image/png" href="/assets/krishisetu-logo.png" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveWebStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveWebStyles = `
  /* Responsive Web Styles for Krishi Setu */
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    background-color: #F5F7F5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Modern custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #E8F5E9;
  }
  ::-webkit-scrollbar-thumb {
    background: #A5D6A7;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #2E7D32;
  }

  /* Prevent overflow jank */
  * {
    box-sizing: border-box;
  }
`;
