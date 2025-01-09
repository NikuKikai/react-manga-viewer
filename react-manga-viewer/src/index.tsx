import React, { useEffect, useRef, useState } from 'react';

import './index.css';


type MangaViewerProps = {
    width: number,
    height: number,
    urls: string[],
    direction?: 'ltr' | 'rtl',
    start_1side?: boolean,
    noLoading?: boolean,
    divideAspect?: number,
    margin?: string,
}


export default function MangaViewer(props: MangaViewerProps) {
    const {
        width,
        height,
        urls,
        direction = 'rtl',
        start_1side = false,
        noLoading = false,
        divideAspect = 1.41,
        margin = '10%',
    } = props;

    const [currIdx, setCurrIdx] = useState(0);
    const [isLoaded, setLoaded] = useState(noLoading);
    // const [npages, setNpages] = useState<number>(0);
    const npages = urls.length;

    const propsRef = useRef<MangaViewerProps>(props);
    const prevProps = useRef<MangaViewerProps>();

    const offcanvases = useRef<HTMLCanvasElement[]>([]);
    const canvasMap = useRef<Map<number, HTMLCanvasElement>>(new Map());

    // const imageMap = useRef<Map<number, HTMLImageElement>>(new Map());
    // const imageLoadedMap = useRef<Map<number, boolean>>(new Map());


    propsRef.current = props;


    // const setCanvasRef = (e: HTMLCanvasElement | null, i: number) => {
    //     if (e) {
    //         canvasMap.current.set(i, e);
    //         updateCanvases();
    //     }
    //     else canvasMap.current.delete(i);
    // };

    // const setImageRef = (e: HTMLImageElement | null, i: number) => {
    //     if (e) {
    //         imageMap.current.set(i, e);
    //         imageLoadedMap.current.set(i, false);
    //     }
    //     else {
    //         imageMap.current.delete(i);
    //         imageLoadedMap.current.delete(i);
    //     }
    // };

    // const handleImageLoad = (i: number, url: string) => {
    //     imageLoadedMap.current.set(i, true);

    //     let loaded = true;
    //     for (let v of imageLoadedMap.current.values()) {
    //         loaded = loaded && v;
    //     }
    //     if (loaded) {
    //         if (!divideAspect) {
    //             for (let imgEle of imageMap.current.values()) {
    //                 const cvs = document.createElement('canvas');
    //                 const ctx = cvs.getContext('2d');
    //                 cvs.width = imgEle.width;
    //                 cvs.height = imgEle.height;
    //                 ctx?.drawImage(imgEle, 0, 0);

    //                 offcanvases.current.push(cvs);
    //             }
    //         }
    //         else {
    //             for (let imgEle of imageMap.current.values()) {
    //                 const R = imgEle.height / imgEle.width;
    //                 const k = Math.round(Math.max(R / divideAspect, 1));
    //                 const h = Math.round(imgEle.height / k);
    //                 for (let i = 0; i < k; i++) {
    //                     const cvs = document.createElement('canvas');
    //                     const ctx = cvs.getContext('2d');
    //                     cvs.width = imgEle.width;
    //                     cvs.height = h;
    //                     ctx?.drawImage(imgEle, 0, -i * h);

    //                     offcanvases.current.push(cvs);
    //                 }
    //             }
    //         }
    //         setNpages(offcanvases.current.length);
    //         setLoaded(true);
    //     }
    // };


    const navigate = (to: 'left' | 'right') => {
        if ((to === 'right') === (direction === 'rtl')) {
            if (currIdx > 0) {
                setCurrIdx(currIdx - 2);
            }
        }
        else {
            if (currIdx < npages - 2 + (start_1side ? 1 : 0)) {
                setCurrIdx(currIdx + 2);
            }
        }
    }
    const handleLeftOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        if (!isLoaded) return;
        navigate('left');
    }
    const handleRightOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        if (!isLoaded) return;
        navigate('right');
    }

    const updateCanvases = () => {
        canvasMap.current.forEach((canvas, i) => {
            if (!canvas) return;
            const cvss = offcanvases.current;
            if (i >= cvss.length) return;
            const cvs = cvss[i];  // off canvas

            // set size
            const kw = canvas.parentElement!.parentElement!.clientWidth / cvs.width;
            const kh = canvas.parentElement!.parentElement!.clientHeight / cvs.height;
            const k = Math.min(kw, kh);
            const w = cvs.width * k;
            const h = cvs.height * k;
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            canvas.parentElement!.style.width = `${w}px`;
            canvas.parentElement!.style.height = `${h}px`;

            // draw
            const ctx = canvas.getContext('2d')!;
            ctx.save();
            ctx.scale(k, k);
            ctx.drawImage(cvs, 0, 0);
            ctx.restore();
        });
    };


    useEffect(() => {
        const onresize = () => {
            updateCanvases();
        }
        window.addEventListener('resize', onresize);

        return () => {
            window.removeEventListener('resize', onresize);
        }
    }, [])

    useEffect(() => {
        setLoaded(!!propsRef.current.noLoading);
        offcanvases.current = [];
    }, [urls, divideAspect]);


    let forceNoTransition = !prevProps.current || prevProps.current.direction !== props.direction || prevProps.current.start_1side !== props.start_1side;


    useEffect(() => {
        prevProps.current = props;
    }, [props])


    return (
        <div className='container' style={{ width: `${width}px`, height: `${height}px` }}>
            {/* Resolve CORS */}
            {/* <div style={{ position: 'absolute', opacity: 0 }}>
                {urls.map((url, i) => {
                    return (<img
                        ref={(e) => { setImageRef(e, i) }}
                        key={url}
                        alt={url}
                        src={url}
                        onLoad={() => { handleImageLoad(i, url) }}
                    />)
                })}
            </div> */}

            {/* 捲り式 Viewer */}
            {/* {offcanvases.current.map((cvs, idx) => { */}
            {urls.map((url, idx) => {
                const i = start_1side ? idx + 1 : idx;  // i represents the position idx.
                const isRight = (direction === 'rtl') === (i % 2 === 0);  // right page if shown
                // const isShownAndLatter = currIdx === i - 1;  // the latter one of 2 pages shown
                // which side should page i be positioned if being read
                const side = (direction === 'rtl') === (i % 2 === 0) ? 'right' : 'left';

                const zIdx = 9999 - 200 * Math.abs(i * 2 - currIdx * 2 - 0);  // the former one of 2 pages shown is on top

                // let z = -2*Math.abs(i*2-currPage*2-1);  // this means, e.g. page 1 and 2 has different z
                let z = -2 * Math.abs((i <= currIdx ? 0 : 2) + currIdx - Math.ceil(i / 2) * 2);  // this means, e.g. page 1 and 2 has the same z

                // pages below will shift to outside
                let x = (i <= currIdx ? 0 : 2) + currIdx - Math.ceil(i / 2) * 2;  // this means, e.g. page 1 and 2 has the same x.
                x /= 2; // x around shown pages will be ... -2, -2, -1, -1, 0, (0, 0,) 0, 1, 1, 2, 2, ... (0, 0,) are currently shown pages.
                if (x >= 1) x -= 1; if (x <= -1) x += 1; // page right below shown pages shouldn't be shifted, to avoid bad look on animation
                const shiftK = 2;
                // dx = Math.min(abs(x) * shiftK, 5);  So integrates is shiftK*x2 or 5x
                if (Math.abs(x) < 5 / shiftK) x = shiftK * x * x * Math.sign(x);
                else x = 5 * x;
                if (direction === 'ltr') x = -x;

                // which side page i is now positioned
                const pos = (i <= currIdx) === (direction === 'rtl') ? 'right' : 'left';
                const rotY = side === pos ? 0 : (side === 'right' ? -180 : 180);

                const shadowSize = (currIdx === i - 1 || currIdx === i) ? 10 : 200;

                return (
                    <div
                        className='comic-page'
                        key={idx}
                        style={{
                            left: side === 'left' ? margin : '50%',
                            top: margin,
                            width: `calc(50% - ${margin})`,
                            height: `calc(100% - ${margin} * 2)`,
                            zIndex: `${zIdx}`,
                            transformOrigin: side === 'left' ? 'right' : 'left',
                            transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg)`,
                            ...(forceNoTransition ? { transitionDuration: '0s' } : {})
                        }}
                    >
                        <img src={url} className='comic-img' style={{
                            objectPosition: (side === 'left' ? 'right' : 'left'),
                            filter: `drop-shadow(${isRight ? 4 : -4}px 0px 2px rgba(0, 0, 0, 0.2))`,
                        }} />

                        {/* shadow */}
                        <div
                            className='comic-img-shadow-div'
                            style={{
                                boxShadow: `inset ${side === 'left' ? '-' : ''}${shadowSize}px 0 ${shadowSize}px -10px rgba(0,0,0,0.3)`,
                                ...(side === 'left' ? { right: 0 } : { left: 0 }),
                                maskImage: `url(${url})`,
                                maskPosition: (side === 'left' ? 'right' : 'left'),
                            }}>
                        </div>
                    </div>
                )
            })}

            {/* Clickable Overlay */}
            <div className='left-overlay' onMouseDown={handleLeftOverlay} />
            <div className='right-overlay' onMouseDown={handleRightOverlay} />

            {/* LOADING overlay */}
            <div className='loading-div' style={{ display: `${isLoaded ? 'none' : 'block'}` }}>
                <p>LOADING...</p>
            </div>


            {/* 横スライド式 Viewer */}
            {/* <div style={{
                display: 'grid',
                overflow: 'hidden',
                height: '100%',
                position: 'absolute',
                direction: 'rtl',
                right: 0,
                gridAutoFlow: 'column',
                transform: `translateX(${width/2*currPage}px)`
            }}>
                {urls.map((page, i)=>{
                    return (
                        <div key={page} style={{width: `${width/2}px`, overflow: 'hidden'}}>
                            <img
                                alt={page}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    objectPosition: i%2===0? 'left': 'right'
                                }}
                                src={page}
                            />
                        </div>
                    )
                })}
            </div> */}
        </div>
    );
}


// function load2img(url: string) {
//     return new Promise<HTMLImageElement>((resolve, reject) => {
//         const imgEle = document.createElement('img');
//         imgEle.crossOrigin = 'anonymous';
//         imgEle.onload = () => {
//             resolve(imgEle);
//         };
//         imgEle.src = url;
//     });
// }
