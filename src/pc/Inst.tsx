import React, { useEffect, useState } from 'react'
import { BrowserLink } from './Browser';

type Profile = {
    id: string;
    avatar: number;
    images: number;
    name: string;
}

const profiles: Record<string, Profile> = {
    "sadmoon": {
        id: "sadmoon",
        avatar: 12,
        images: 141,
        name: "Sad Moon"
    },
    "verforez": {
        id: "verforez",
        avatar: 102,
        images: 108,
        name: "Veronya"
    },
    "vikundr": {
        id: "vikundr",
        avatar: 162,
        images: 209,
        name: "Vika"
    },
    "froggi": {
        id: "froggi",
        avatar: 214,
        images: 229,
        name: "Seraphima"
    },
    "milky_lady": {
        id: "milky_lady",
        avatar: 1279,
        images: 1303,
        name: "Milky Lady"
    },
    "zlmmlz": {
        id: "zlmmlz",
        avatar: 139,
        images: 157,
        name: "zlmmlz"
    },
    "konserva": {
        id: "konserva",
        avatar: 47,
        images: 58,
        name: "Konserva"
    }
}

export const Inst = ({
    rest,
    handleLinkClick
}: { 
    rest: string,
    handleLinkClick: (url: string) => void
}) => {

    const [profile, setProfile] = useState<Profile | null>(null);
    const [status, setStatus] = useState(200);

    useEffect(() => {
        rest = rest.replace('/', '');
        if (rest != "") {
            if (profiles[rest]) {
                setProfile(profiles[rest]);                
            }
            else {
                setStatus(404);
                setProfile(null); 
            }
        }
        else {
            setProfile(null); 
            setStatus(200);
        }
    }, [rest])

    if (status == 404) {
        return ( <div className='inst'>
            <h1>Error {status}</h1>
            <BrowserLink url="inst.com" handleLinkClick={handleLinkClick}>Return</BrowserLink>
        </div>)
    }

    return (<div className='inst'>
        {profile ? <div className='profile'>
            <div className="profile__header">
                <img className='profile__header__avatar' src={`/pc/inst/${profile.id}/${profile.avatar}.gif`}/>
                <div className="profile__header__name">{profile.name}</div>
                <BrowserLink url="inst.com" handleLinkClick={handleLinkClick}>Return</BrowserLink>
            </div>
            <div className="profile__image-list">
            {Array.from({ length: profile.images }, (_, index) => (
                <div 
                    key={index} 
                    className='image' 
                    style={{backgroundImage: `url(/pc/inst/${profile.id}/${profile.images - index - 1}.gif)`, "--index": index} as React.CSSProperties}
                />
            ))}    
            </div>    
        </div>
        :
        <div className='following'>
            <h1>Following</h1>
            <div className="following__list">
            {Object.values(profiles).map((profile, index) => (
                <div className='profile-link' key={index} onClick={() => setProfile(profile)}>
                    <BrowserLink url={"inst.com/" + profile.id} handleLinkClick={handleLinkClick}>
                        <img className='profile-link__avatar' src={`/pc/inst/${profile.id}/${profile.avatar}.gif`}/>
                        <div className='profile-link__name'>{profile.name}</div>
                    </BrowserLink>
                </div>
            ))}     
            </div>   
        </div>}
    </div>)
}