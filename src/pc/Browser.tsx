import React, { useEffect, useState, ReactNode } from 'react'
import Draggable from 'react-draggable'
import { Inst } from './Inst';
import { Sara } from './Sara';
import { CharacterAI } from './CharacterAI';

export const BrowserLink = ({
    children,
    url,
    handleLinkClick
}: {
    url: string,
    children: ReactNode,
    handleLinkClick: (url: string) => void
}) => {
    return <div className='browser-link' onClick={() => handleLinkClick(url)}>{children}</div>
}

export const Browser = ({
    setApps,
}: {
    setApps: React.Dispatch<React.SetStateAction<string[]>>,
}) => {
    const [url, setUrl] = useState("sara.com");
    const [page, setPage] = useState(<div>Loading</div>);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            getPage();
        }
    };

    const handleLinkClick = (url: string) => {
        setUrl(url);
        getPage(url);
    };

    useEffect(() => {
        getPage();
    }, []);

    const getPage = (customUrl: string | null = null) => {
        let urlBase = (customUrl ?? url).split('/')[0];
        let urlRest = (customUrl ?? url).replace((customUrl ?? url).split('/')[0], '');

        switch (urlBase) {
            case "browser:homepage":
                setPage(<div className='home-page'>
                    <h1>Welcome</h1>
                    <p>You are now connected to a private network that only allows access to specific content</p>
                    <div className='id'>ID: 73-61-72-61</div>
                    {/* <BrowserLink handleLinkClick={handleLinkClick} url="inst.com">Inst</BrowserLink> */}
                </div>);
                break;
            case "sara.com":
                setPage(<Sara/>);
                break;
            case "cai":
                setPage(<CharacterAI/>);
                break;
            case "nkd.com":
                setPage(<div className='nkd-page'>
                    <h1>NKD</h1>
                    <h3>made by <a href="https://enkada.ru" target='blank'>Enkada</a></h3>
                    <p>Version 0 (as for 12.09.23)</p>
                    <p>TODO List:</p>
                    <ul>
                        <li>Partially move Location/Action logic into getContent</li>
                        <li>Bettter Return in actions</li>
                        <li>improve extraContent - add \n</li>
                        <li>Ignored actions</li>
                        <li>Loiter</li>
                        <li>More animation</li>
                    </ul>
                </div>);
                break;
            case "inst.com":
                setPage(<Inst rest={urlRest} handleLinkClick={handleLinkClick} />);
                break;
            default:
                setPage(<div className='page404'>
                    <h1>This site can’t be reached</h1>
                    <p>Check if there is a typo in {url}</p>
                </div>);
        }
    }


    return (<Draggable handle='.window__top-bar'>
        <div className='window browser'>
            <div className="window__top-bar">
                <div className="window__top-bar__title">Internet Browser</div>
                <div className="window__top-bar__btn-list">
                    <div className="btn btn-close" onClick={() => setApps(apps => apps.filter(x => x !== 'Browser'))}>X</div>
                </div>
            </div>
            <div className="browser__tool-bar">
                <BrowserLink handleLinkClick={handleLinkClick} url="browser:homepage">🏠</BrowserLink>
                <input
                    type='text'
                    className="browser__url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyUp={handleKeyPress}
                />
            </div>

            <div className="browser__page">
                <div className="browser__page__body">
                    {page}
                </div>
            </div>
        </div>
    </Draggable>)
}