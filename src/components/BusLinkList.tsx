import { timeToString } from '../Utils';
import { LocationPath, LOCATIONS } from '../types/Location';

export const BusLinkList = ({
	paths, handleLocationChange, initialIndex = 0
}: {
	paths: LocationPath[];
	handleLocationChange: (path: LocationPath) => void;
	initialIndex?: number | 0;
}) => {
    return (
        <div className='link-list'>
            {paths.map((locationPath, index) => {
                const location = LOCATIONS[locationPath.id];

                return (
                    <div key={location.id} className={`link location`} onClick={() => handleLocationChange(locationPath)} style={{ "--index": initialIndex + index } as React.CSSProperties}>
                        <div className="link__emoji" style={location.hue ? { "--hue": location.hue + 'deg' } as React.CSSProperties : {}}>{location.emoji}</div>
                        <div className="link__title">{location.title}</div>
                        {!!(locationPath.time > 0) && <div className="link__time">({timeToString(locationPath.time)})</div>}
                    </div>
                );
            })}
        </div>
    )
}
