
A react component that creates a realistic book-like manga viewer.

Example: [My manga "Q"](https://nikukikai.art/Q)

Sample codes:
```typescript
// For RCA project:
// import MangaViewer from "react-manga-viewer";

// For next.js project:
import dynamic from 'next/dynamic';
const MangaViewer = dynamic(() => import('react-manga-viewer'), {
    ssr: false, // Disable SSR for this component
});

// Images
const pages = [
    '/assets/1.png',
    '/assets/2.png',
    '/assets/3.png',
    '/assets/4.png',
    '/assets/5.png',
];


export default function SamplePage() {
    return <Suspense><SamplePageInner /></Suspense>
}

function SamplePageInner() {
    const [width, height] = useWindowSize();

    return <MangaViewer
        width={width} height={height}
        urls={pages}
        margin={'5%'}
        noLoading={true}
        start_1side={false}
    />
}
```
