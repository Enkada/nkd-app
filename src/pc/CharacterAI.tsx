import React, { useState, useEffect, useRef } from 'react'

type Message = {
    text: string,
    isMine: boolean,
    isError?: boolean
}

type HistoryMessage = {
    text: string,
    src__is_human: boolean
}

export const CharacterAI = () => {
    const [message, setMessage] = useState("");
    const [messageHistory, setMessageHistory] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const historyRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        fetch('http://127.0.0.1:5000/history').then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch API');
            }
            return response.text();
        }).then((text) => {
            setMessageHistory((JSON.parse(text).data as HistoryMessage[]).map(x => {return {text: x.text, isMine: x.src__is_human}}));
        })
    }, [])

    const handleDeleteHistory = () => {
        if (confirm("Are you sure you want to delete history?")) {
            setMessageHistory([]);

            fetch('http://127.0.0.1:5000/delete', {
                method: 'POST'
            })
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
        if (event.key === 'Enter') {
            setMessageHistory(prev => [...prev, {text: message, isMine: true}]);

            setMessage("");
            setIsTyping(true);

            fetch('http://127.0.0.1:5000/cai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            }).then (response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch API');
                }
                return response.text();
            }).then((text) => {
                setMessageHistory(prev => [...prev, {text: JSON.parse(text).text, isMine: false}]);
                setIsTyping(false);
            }).catch((error) => {
                console.error('Error fetching result', error);
                // Change last message (get it using slice) in history array to have error
                setMessageHistory(prev => [...prev.slice(0, -1), {text: prev.slice(-1)[0].text, isMine: true, isError: true}]);

            });
        }
    };

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [messageHistory])

    return (
        <div className='cai-chat'>
            <div className="cai-chat__history" ref={historyRef}>
                {messageHistory.map((message, index) => (
                    <div key={index} className={`message ${message.isMine ? "mine" : ""} ${message.isError ? "error" : ""}`}>{message.text}</div>
                ))}
            </div>            
            <div className="cai-chat__input">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleKeyPress}
                />
                <div className='btn btn-delete' onClick={handleDeleteHistory}>🚮</div>
            </div>
            {!!isTyping && <div className="cai-chat__typing">sara is typing</div>}
        </div>
    )
}
