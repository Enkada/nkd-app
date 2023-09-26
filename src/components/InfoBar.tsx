import { Stat } from '../App'
import { getDate, timeToString } from '../Utils'

export const InfoBar = ({
    stat
}: {
    stat: Stat
}) => {

    const { location, money, energy, food, time, day } = stat;

    return (
        <div className="info-bar">
            <div className='info-bar__left'>
                <div className="stat date" title={`Day ${day}`}>{getDate(day).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                <div className="stat money">
                    <span className='emoji'>💳</span>
                    <span className='money__value'>{money.toFixed(2).replace('.00', '').replace('-0', '0')} $</span>
                </div>
                <div className="stat energy progress">
                    <span className='emoji'>⚡</span>
                    <progress max={energy.max} value={energy.current} />
                </div>
                <div className="stat food progress">
                    <span className='emoji'>🍔</span>
                    <progress max={food.self.max} value={food.self.current} />
                </div>
                <div className="stat food progress">
                    <span className='emoji'>👧🏻</span>
                    <progress max={food.sara.max} value={food.sara.current} />
                </div>
            </div>
            <div className="stat time">{timeToString(time)}</div>
            <div className="stat location">
                {location.title} <span className='emoji' style={location.hue ? { "--hue": location.hue + 'deg' } as React.CSSProperties : {}}>{location.emoji}</span>
            </div>
        </div>
    )
}
