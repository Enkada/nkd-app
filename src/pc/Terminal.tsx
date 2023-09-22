import React, { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { File } from './PCScreen'

const getRow = (text: string, user: string | null, path: string | null = null, index: number = 0) => {
    return <div className='row' key={index}>
        {!!(user && path) && <>
            <span className='user'>{user}</span>
            <span>:{path} </span>
        </>}
        <span>{text}</span>
    </div>
}

export const Terminal = ({
    setApps,
    root
}: {
    setApps: React.Dispatch<React.SetStateAction<string[]>>,
    root: File
}) => {
    const [history, setHistory] = useState<JSX.Element[]>([getRow("Terminal v0", null)])

    const [command, setCommand] = useState("");
    const [user, setUser] = useState<string>("user");

    const [folderStack, setFolderStack] = useState<File[]>([root]);
    const currentPath = folderStack.map((folder, index) => (index === 0 ? "/" : folder.name + "/"));
    const currentFolder = folderStack[folderStack.length - 1];

    const getFolderByFolderNameStack = (folders: string[]) => {
        let finalFolder = root;
        for (const folder of folders) {
            const folderChild = finalFolder.children?.find((file) => file.name === folder);
            if (!folderChild) {
                return null;
            }
            finalFolder = folderChild;
        }

        return finalFolder;
    }

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

        setHistory(prev => [...prev, getRow(content, userName as string | null, currentPath.join(""), history.length + (++index))]);
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
            case "cd":
                if (args[1] === "..") {
                    setFolderStack(folderStack.slice(0, -1));
                }
                else if (currentFolder.children?.find((file) => file.name === args[1])) {
                    setFolderStack([...folderStack, currentFolder.children?.find((file) => file.name === args[1])!]);
                }
                else {
                    handleAddRow(`Unknown folder "${args[1] || ""}"`, null);
                }
                break;
            case "ls":
                let lsFiles = "";
                if (args[1]) {
                    const lsFolderPath = args[1].replace(/\/(.*)/g, "$1").split('/');
                    const lsFolder = getFolderByFolderNameStack(lsFolderPath);
                    if (!lsFolder) {
                        handleAddRow(`Unknown folder "${args[1] || ""}"`, null);
                        return;
                    }
                    lsFiles = lsFolder.children?.map((file) => (file.type === "folder" ? `[${file.name}]` : file.name)).join("\t") + "";
                }
                else {
                    lsFiles = currentFolder.children?.map((file) => (file.type === "folder" ? `[${file.name}]` : file.name)).join("\t") + "";
                }
                handleAddRow(lsFiles, null);
                break;
            case "help":
                handleAddRow(`Available commands: clear/cls, user, cd, ls, help, exit/quit/q/close`, null);
                break;
            case "exit":
            case "quit":
            case "q":
            case "close":
            case "end":
            case "stop":
            case "abort":
                setApps(apps => apps.filter(x => x !== 'Terminal'));
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
                    <span className='user'>{user}</span>
                    <span>:{currentPath}</span>
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
