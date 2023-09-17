import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // or your chosen style


interface CodeHighlightProps {
    code: string;
    language: string; // e.g., 'javascript'
}


export const CodingGame = () => {
    const [code, setCode] = useState("");
    const [length, setLength] = useState(0);

    useEffect(() => {
        getFile();

        window.addEventListener('keydown', handleKeyPress);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const getFile = () => {
        setLength(0);

        fetch(`/pc/code/${1}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch .txt file');
                }
                return response.text();
            })
            .then((text) => setCode(text))
            .catch((error) => console.error('Error fetching .txt file:', error));
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        setLength((prev) => prev + 2);
        console.log(length, code.length);

        if (length >= code.length) {
            getFile();
        }
    };

    if (code == "")
        return;

    return (
        <div className="coding-game">
            <SyntaxHighlighter language={"javascript"} style={vscDarkPlus}>
                {code.substring(0, length)}
            </SyntaxHighlighter>
        </div>
    );
}
