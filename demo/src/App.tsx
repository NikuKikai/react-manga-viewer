import React from 'react';
import './App.css';

import { useWindowSize } from "@react-hook/window-size";
import MangaViewer from 'react-manga-viewer';


const urls = [
  '/imgs/1.jpg',
  '/imgs/2.jpg',
]

function App() {
  const [width, height] = useWindowSize();

  return (
    <div className="App">
      <MangaViewer
        width={width}
        height={height}
        urls={urls}
        direction={'ltr'}
        start_1side={true}
        noLoading={false}
        divideAspect={1.41}
      />
    </div>
  );
}

export default App;
