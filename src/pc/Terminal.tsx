import React, { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { StatKeys } from '../App'

const getRow = (text: string, user: string | null, index: number = 0) => {
    return <div className='row' key={index}>{!!user && <><span className='user'>{user}</span><span>: </span></>}<span>{text}</span></div>
}

export const Terminal = ({
    setApps,
    setStat
}: {
    setApps: React.Dispatch<React.SetStateAction<string[]>>,
    setStat: (key: StatKeys, value: any, action?: "=" | "=>") => void
}) => {
    const [history, setHistory] = useState<JSX.Element[]>([getRow("Terminal v0", null)])

    const [command, setCommand] = useState("");
    const [user, setUser] = useState<string>("user");

    const inputRef = useRef<HTMLInputElement | null>(null);

    let index = 0;

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleCommand(command);
            setCommand("");
        }
    };

    const handleAddRow = (content: string, userName?: string | null) => {
        if (userName === undefined) {
            userName = user;
        }

        setHistory(prev => [...prev, getRow(content, userName as string | null, history.length + (++index))]);
    }

    const handleCommand = (command: string) => {
        handleAddRow(command);

        const args = command.split(' ');

        switch (args[0]) {
            case "clear":
            case "cls":
                setHistory([]);
                break;
            case "user":
                setUser(args[1]);
                break;
            case "stat":
                setStat(args[1] as StatKeys, Number(args[2]));
                break;
            default:
                handleAddRow(`Unknown command "${command}"`, null);
                break;
        }
    }

    const handleFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    return (<Draggable handle='.window__top-bar'>
        <div className='window terminal'>
            <div className="window__top-bar">
                <div className="window__top-bar__title">Terminal</div>
                <div className="window__top-bar__btn-list">
                    <div className="btn btn-close" onClick={() => setApps(apps => apps.filter(x => x !== 'Terminal'))}>X</div>
                </div>
            </div>
            <div className="terminal__content">
                <div className="terminal__history">{history}</div>
                <div className='terminal__focus-area' onClick={handleFocus}></div>
                <div className='terminal__input'>
                    <span className='user'>{user}</span>:
                    <input
                        type="text"
                        value={command}
                        ref={inputRef}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyUp={handleKeyPress}
                    />
                </div>
            </div>

        </div>
    </Draggable>)
}
