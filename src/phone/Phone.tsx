import { useState } from 'react'
import Draggable from 'react-draggable'
import { SetStat, Stat } from '../App'
import { timeToString } from '../Utils'
import { Browser } from '../pc/Browser'
import { DatingApp } from './DatingApp'

export const Phone = ({ stat, setStat }: {
    stat: Stat,
    setStat: SetStat;
}) => {

    const { time } = stat;
    const [app, setApp] = useState("desktop");

    const apps = [
        {
            emoji: "👩🏻‍❤️‍💋‍👨🏻",
            name: "Dating App"
        },
        {
            emoji: "🌐",
            name: "Browser"
        }
    ]

    return (<Draggable>
        <div className="phone">
            <div className="phone__status-bar">
                <div className="phone__status-bar__wifi emoji">📶</div>
                <div className="phone__status-bar__time">{timeToString(time)}</div>
                <div className="phone__status-bar__battery emoji">🔋</div>
            </div>
            <div className={`phone__content ${app}`}>
                {!!(app === "desktop") && apps.map((app, index) => 
                <div key={index} className="app" onClick={() => setApp(app.name.toLowerCase().replace(/ /g, "-"))}>
                    <div className="app__emoji">{app.emoji}</div>    
                    <div className="app__name">{app.name}</div>
                </div>
                )}
                {!!(app === "browser") &&  <Browser/> }
                {!!(app === "dating-app") && <DatingApp stat={stat} setStat={setStat}/>}
            </div>
            <div className="phone__navigation-bar">
                <div className="phone__navigation-bar__btn-back ">{"<"}</div>
                <div className="phone__navigation-bar__btn-home" onClick={() => setApp("desktop")}>{"( )"}</div>
                <div className="phone__navigation-bar__btn-third">{"[ ]"}</div>
            </div>
        </div>	
    </Draggable>)
}
