import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import { Browser } from './Browser'
import { Terminal } from './Terminal'
import { StatKeys } from '../App'

type File = {
    name: string,
    icon: string,
    type: "folder" | "img" | "txt",
    children?: File[]
}

const createFolder = (name: string, children?: File[]): File => {
    return {
        name: name,
        icon: "📁",
        type: "folder",
        children: children || []
    }
}

const createTxt = (name: string, ext: string = "txt"): File => {
    return {
        name: name + "." + ext,
        icon: "📜",
        type: "txt"
    }
}

const createImg = (name: string): File => {
    return {
        name: name,
        icon: "🖼",
        type: "img"
    }
}

const EXPLORER_ROOT: File = createFolder(
    "Explorer",
    [
        createFolder("Browser", [
            createTxt("homepage", "html"),
            createTxt("sara", "md"),
        ]),
        createFolder("Downloads", [
            
        ]),
        createFolder("Wallpapers", [
            createImg("wallpaper.png"),
            createImg("wallpaper_sara.png")
        ]),
    ]
)

const ImgViewer = ({
    img,
    setImg
}: {
    img: string,
    setImg: React.Dispatch<React.SetStateAction<string | null>>
}) => {
    return (<Draggable handle='.window__top-bar'>
        <div className='window img-viewer'>
            <div className="window__top-bar">
                <div className="window__top-bar__title">{img}</div>
                <div className="window__top-bar__btn-list">
                    <div className="btn btn-close" onClick={() => setImg(null)}>X</div>
                </div>
            </div>
            <img src={`/pc/img/` + img} />
        </div>
    </Draggable>);
}
const TxtViewer = ({
    txt,
    setTxt
}: {
    txt: string,
    setTxt: React.Dispatch<React.SetStateAction<string | null>>
}) => {
    const [text, setText] = useState("null");

    useEffect(() => {
        fetch(`/pc/txt/${txt}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch .txt file');
                }
                return response.text();
            })
            .then((text) => setText(text))
            .catch((error) => console.error('Error fetching .txt file:', error));
    }, []);


    return (<Draggable handle='.window__top-bar'>
        <div className='window txt-viewer'>
            <div className="window__top-bar">
                <div className="window__top-bar__title">{txt}</div>
                <div className="window__top-bar__btn-list">
                    <div className="btn btn-close" onClick={() => setTxt(null)}>X</div>
                </div>
            </div>
            <div className="txt-viewer__text">{text.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {index !== 0 ? <br /> : ""}{line}
                </React.Fragment>
            ))}</div>
        </div>
    </Draggable>);
}

const Explorer = ({
    setApps,
    setTxt,
    setImg
}: {
    setApps: React.Dispatch<React.SetStateAction<string[]>>,
    setTxt: React.Dispatch<React.SetStateAction<string | null>>,
    setImg: React.Dispatch<React.SetStateAction<string | null>>
}) => {
    const [folderStack, setFolderStack] = useState<File[]>([EXPLORER_ROOT]);

    const handleFileClick = (file: File) => {
        if (file.type === 'folder') {
            setFolderStack((prevStack) => [...prevStack, file]);
        }
        else if (file.type === 'img') {
            setImg(file.name);
        }
        else if (file.type === 'txt') {
            setTxt(file.name);
        }
    };

    const handleBackClick = () => {
        if (folderStack.length > 1) {
            // Remove the top folder from the stack to go back one level
            const newStack = folderStack.slice(0, -1);
            setFolderStack(newStack);
        }
    };

    const currentFolder = folderStack[folderStack.length - 1];

    return (<Draggable handle='.window__top-bar'>
        <div className='window explorer'>
            <div className="window__top-bar">
                <div className="window__top-bar__title">{folderStack.map((folder, index) => (index === 0 ? "Explorer - /" : folder.name + "/"))}</div>
                <div className="window__top-bar__btn-list">
                    <div className="btn btn-close" onClick={() => setApps(apps => apps.filter(x => x !== 'Explorer'))}>X</div>
                </div>
            </div>
            <div className="explorer__file-list">
                {!!(currentFolder != EXPLORER_ROOT) && <div className='file' onClick={handleBackClick}>
                    <div className="file__icon">🔙</div>
                    <div className="file__name">. . .</div>
                </div>}
                {currentFolder.children?.map((file, index) => (
                    <div
                        className="file"
                        key={index}
                        onClick={() => handleFileClick(file)}
                    >
                        <div className="file__icon">{file.type == "img" ? <img src={`/pc/img/` + file.name} /> : file.icon}</div>
                        <div className="file__name">{file.name}</div>
                    </div>
                ))}
            </div>
        </div>
    </Draggable>)
}

export const PCScreen = ({
    handlePCExit,
    setStat
}: {
    handlePCExit: () => void,
    setStat: (key: StatKeys, value: any, action?: "=" | "=>") => void
}) => {

    const [apps, setApps] = useState<string[]>([]);
    const [img, setImg] = useState<string | null>(null);
    const [txt, setTxt] = useState<string | null>(null);

    const AppIcon = ({ emoji, name }: {
        emoji: string, name: string
    }) => {
        return <div className="app" onClick={() => setApps([...apps, name])}>
            <div className="app__icon">{emoji}</div>
            <div className="app__name">{name}</div>
        </div>
    }

    if (apps.includes("Exit")) {
        handlePCExit();
    }

    return (
        <div className="pc">
            <div className='table' />
            <img className='leg-shadow' src="/pc/leg.png" />
            <img className='leg' src="/pc/leg.png" />
            <div className={`screen desktop`}>
                {(<>
                    <AppIcon emoji='🌐' name='Browser' />
                    <AppIcon emoji='📁' name='Explorer' />
                    <AppIcon emoji='👩🏻‍💻' name='Terminal' />
                    <AppIcon emoji='🚪' name='Exit' />
                </>)}
                {!!(apps.includes("Browser")) && <Browser setApps={setApps} />}
                {!!(apps.includes("Explorer")) && <Explorer setApps={setApps} setImg={setImg} setTxt={setTxt} />}
                {!!(apps.includes("Terminal")) && <Terminal setStat={setStat} setApps={setApps} />}
                {!!img && <ImgViewer img={img} setImg={setImg} />}
                {!!txt && <TxtViewer txt={txt} setTxt={setTxt} />}
            </div>
        </div>
    )
}
