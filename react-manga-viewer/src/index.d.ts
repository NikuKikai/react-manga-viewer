

export declare type MangaViewerProps = {
    width: number,
    height: number,
    urls: string[],
    direction?: 'ltr' | 'rtl',
    start_1side?: boolean,
    noLoading?: boolean,
    divideAspect?: number,
}

declare function MangaViewer(props: MangaViewerProps): JSX.Element | null;
export default MangaViewer;
