import React, { useEffect, useRef, useState } from 'react';

import './index.css';


type MangaViewerProps = {
    width: number,
    height: number,
    urls: string[],
    direction?: 'ltr'|'rtl',
    start_1side?: boolean,
    noLoading?: boolean,
}


export default function MangaViewer(props: MangaViewerProps) {
    const {width, height, urls, direction='rtl', start_1side=false, noLoading=false} = props;
    const [currIdx, setCurrIdx] = useState(0);
    // const [isForward, setForward] = useState(true);
    const [isLoaded, setLoaded] = useState(noLoading);

    const prevProps = useRef<MangaViewerProps>();
    const loadedList = useRef<string[]>([]);
    const imgMap = useRef<Map<string, HTMLImageElement>>(new Map());


    const navigate = (to: 'left'|'right') => {
        if ((to==='right') === (direction==='rtl')) {
            if (currIdx > 0) {
                // setForward(false);
                setCurrIdx(currIdx-2);
            }
        }
        else {
            if (currIdx < urls.length-2+ (start_1side?1:0)) {
                // setForward(true);
                setCurrIdx(currIdx+2);
            }
        }
    }

    const checkLoaded = () => {
        const list = loadedList.current;

        // Remove invalid
        for (let i=list.length-1; i>=0; i--) {
            if (urls.indexOf(list[i]) === -1) {
                list.splice(i, 1);
            }
        }

        const loaded = list.length === urls.length
        if (isLoaded !== loaded)
            setLoaded(loaded);
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

    const updateImgSize = (img: HTMLImageElement)=>{
        const kw = img.parentElement!.parentElement!.clientWidth / img.naturalWidth;
        const kh = img.parentElement!.parentElement!.clientHeight / img.naturalHeight;
        const k = Math.min(kw, kh);
        const w = img.naturalWidth*k;
        const h = img.naturalHeight*k;
        img.style.width = `${w}px`;
        img.style.height = `${h}px`;
        img.parentElement!.style.width = `${w}px`;
        img.parentElement!.style.height = `${h}px`;
    }


    useEffect(()=>{
        const onresize = ()=>{
            imgMap.current.forEach(img => {
                updateImgSize(img);
            });
        }
        window.addEventListener('resize', onresize);

        return ()=>{
            window.removeEventListener('resize', onresize);
        }
    }, [])


    let forceNoTransition = !prevProps.current || prevProps.current.direction!==props.direction || prevProps.current.start_1side!==props.start_1side;


    useEffect(()=>{
        prevProps.current = props;
    }, [props])


    return (
        <div className='container'
            style={{
                width: `${width}px`,
                height: `${height}px`,
            }}
        >

            {/* 捲り式 Viewer */}
            {urls.map((url, i)=>{
                if (start_1side) {
                    i += 1;
                }
                // which side should page i be positioned if being read
                const side = (direction==='rtl')===(i%2===0)? 'right':'left';

                const zIdx = 10000-200*Math.abs(i*2-currIdx*2-1);  // this must be integer, so scale it up for transition.

                // let z = -2*Math.abs(i*2-currPage*2-1);  // this means, e.g. page 1 and 2 has different z
                let z = -2*Math.abs((i<=currIdx?0:2) + currIdx - Math.ceil(i/2)*2);  // this means, e.g. page 1 and 2 has the same z

                // pages below will shift to outside
                let x = (i<=currIdx?0:2) + currIdx - Math.ceil(i/2)*2;  // this means, e.g. page 1 and 2 has the same x
                if (x >= 2) x-= 2;
                if (x <= -2) x+= 2;
                x *= 3;
                if (direction==='ltr') x = -x;

                // which side page i is now positioned
                const pos = (i<=currIdx) === (direction==='rtl')? 'right': 'left';
                const rotY = side===pos? 0: (side==='right'? -180: 180);

                return (
                    <div
                        className='comic-page'
                        key={url}
                        style={{
                            left: side==='left'? '10%': '50%',
                            zIndex: `${zIdx}`,
                            transformOrigin: side==='left'? 'right': 'left',
                            transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg)`,
                            ...(forceNoTransition?{transitionDuration: '0s'}: {})
                        }}
                    >
                        {url!==''? (
                            <div
                                className='comic-img-container'
                                style={{
                                    ...(side==='left'? {right: 0}: {left: 0}),
                                }}
                            >
                                <img
                                    ref={e=>{
                                        if (e){
                                            imgMap.current.set(url, e);
                                            updateImgSize(e);
                                        }
                                        else imgMap.current.delete(url);
                                    }}
                                    className='comic-img'
                                    alt={url}
                                    src={url}
                                    onLoad={(e: React.UIEvent<HTMLImageElement>)=>{
                                        updateImgSize(e.target as HTMLImageElement);
                                        if (loadedList.current.indexOf(url) === -1)
                                            loadedList.current.push(url);
                                        checkLoaded();
                                    }}
                                />
                                <div style={{boxShadow: `inset ${side==='left'? '-':''}10px 0 10px -10px rgba(0,0,0,0.3)`}}>
                                </div>
                            </div>
                        ): undefined}
                    </div>
                )
            })}

            {/* Clickable Overlay */}
            <div className='left-overlay' onMouseDown={handleLeftOverlay}/>
            <div className='right-overlay' onMouseDown={handleRightOverlay}/>

            {/* LOADING overlay */}
            <div className='loading-div' style={{display: `${isLoaded?'none':'block'}`}}>
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
    // return (
    //     <>
    //         <ComicViewer pages={urls}/>
    //     </>
    // );
}