import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown';

function calculateAge(birthDate: string) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }

    return age;
}

export const Sara = () => {
    const [descrption, setDescrption] = useState("")

    useEffect(() => {
        fetch(`/pc/txt/sara.md`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch .txt file');
                }
                return response.text();
            })
            .then((text) => setDescrption(text.replace(/<!--[\s\S]*?-->/g, '')))
            .catch((error) => console.error('Error fetching .txt file:', error));
    }, [])


    return (<div className='sara-page'>
        <div className='intro'>
            <img src="/pc/img/sara.png" />
            <div className='intro__text'>
                <h1>Sara</h1>
                <p><b>Sara</b> is one of the in-game characters</p>
            </div>
        </div>

        <h2>Description</h2>
        <p><small>Version 1, last modified 16.09.23</small></p>
        <p>The following text describes all possible details about Sara: her character, motivation, manner of speech, appearance, etc.</p>

        <table>
            <tr><td>Full Name</td><td>Sara Holt</td></tr>
            <tr><td>Birthdate</td><td>06.01.2003 ({calculateAge("2003-01-06")}yo)</td></tr>
            <tr><td>Gender</td><td>Female</td></tr>
            <tr><td>Height</td><td>160 cm</td></tr>
            <tr><td>Weight</td><td>55 kg</td></tr>
        </table>

        <ReactMarkdown
            components={{
                pre: (props) => {
                    const content = (props?.children[0] as JSX.Element).props.children[0] as string;

                    const resultString = content.replace(/`([^`]+)`/gm, (_, header) => {
                        
                        const escapedHeader = header.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                        const headerContentMatch = descrption.match(new RegExp(`###\\s+${escapedHeader}([\\s\\S]*?)(?=##|###|$)`));

                        
                        if (headerContentMatch) {
                            const content = headerContentMatch[1].trim();
                            return content.split('\n\r').map((x) => `${x.includes('\n') ? '\n' : ''}{{user}}: ${x.replace(/\n/g, '')}`).join('\n');
                        }
                        return '`' + header + '`';
                    }).replace(/Sara/g, '{{char}}');

                    return <>
                        <div className="btn-copy" onClick={() => navigator.clipboard.writeText(resultString)}>Copy 📋</div>
                        <pre>{resultString}</pre>
                    </>;
                }
            }}
        >
            {descrption}
        </ReactMarkdown>
    </div>)
}
