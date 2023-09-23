import { Stat } from '../App'
import { getDate, timeToString } from '../Utils'

export const InfoBar = ({
    stat
}: {
    stat: Stat
}) => {
    return (
        <div className="info-bar">
            <div className='info-bar__left'>
                <div className="stat date" title={`Day ${stat.day}`}>{getDate(stat.day).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                <div className="stat money">
                    <span className='emoji'>💳</span>
                    <span className='money__value'>{stat.money.toFixed(2).replace('.00', '').replace('-0', '0')} $</span>
                </div>
                <div className="stat energy progress">
                    <span className='emoji'>⚡</span>
                    <progress max={stat.energy.max} value={stat.energy.current} />
                </div>
                <div className="stat food progress">
                    <span className='emoji'>🍔</span>
                    <progress max={stat.food.self.max} value={stat.food.self.current} />
                </div>
                <div className="stat food progress">
                    <span className='emoji'>👧🏻</span>
                    <progress max={stat.food.sara.max} value={stat.food.sara.current} />
                </div>
            </div>
            <div className="stat time">{timeToString(stat.time)}</div>
            <div className="stat location">{stat.location.title}</div>
        </div>
    )
}
