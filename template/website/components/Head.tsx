import React from 'react';
import HeadTag from 'next/head';

interface HeadProps {
    title?: string;
    image?: string;
    description?: string;
}

const Head: React.FC<HeadProps> = ({ title, image, description }) => (
    <HeadTag>
        <title>{title || ""}</title>
        <link rel="icon" type="image/png" href={image} />

        {/* Meta Tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} /> 
        <link rel="canonical" href="dev.divlo.fr"/> 
        <meta name="Language" content="fr" /> 
        <meta name="theme-color" content="#ffd800" />

        {/* Open Graph Metadata */}
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" /> 
        <meta property="og:url" content="https://dev.divlo.fr/" /> 
        <meta property="og:image" content={image} /> 
        <meta property="og:description" content={description} /> 
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Next.js TypeScript App" /> 

        {/* Twitter card Metadata */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:site" content="@Divlo_FR" />
        <meta name="twitter:image:src" content={image} />
        <meta name="twitter:creator" content="@Divlo_FR" />

        {/* PWA Data */}
        <link rel="manifest" href="/manifest.json" />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='mobile-web-app-capable' content='yes' />
        <link rel="apple-touch-icon" href={image} />
    </HeadTag>
);

Head.defaultProps = {
    title: "Next.js TypeScript App", 
    description: "Starter TypeScript Next.js project.",
    image: "/images/icons/icon-96x96.png"
}

export default Head;