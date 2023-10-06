import { timeToString, checkConditions } from '../Utils';
import { LocationPath, LOCATIONS } from '../types/Location';
import { Stat } from '../App';

export const LocationLinkList = ({
	paths, handleLocationChange, initialIndex = 0, stat
}: {
	paths: LocationPath[];
	handleLocationChange: (path: LocationPath) => void;
	initialIndex?: number | 0;
	stat: Stat;
}) => {

	if (stat.location.id.startsWith("bus_stop_")) {
		paths = paths.filter(x => !x.id.startsWith("bus_stop_"));
	}

	return (<div className='link-list'>
		{paths.map((locationPath, index) => {
			const location = LOCATIONS[locationPath.id];
			
			const unavailabilityReason = checkConditions(location.conditions, stat)?.reason;			

			if (unavailabilityReason === null) {
				return null;
			}

			return (
				<div key={location.id} className={`link location ${unavailabilityReason ? "ignored" : ""} ${location.id.includes('bus_stop') ? "bus-stop" : ""}`} onClick={unavailabilityReason ? () => { } : () => handleLocationChange(locationPath)} style={{ "--index": initialIndex + index } as React.CSSProperties}>
					<div className="link__emoji" style={location.hue ? { "--hue": location.hue + 'deg' } as React.CSSProperties : {}}>{location.emoji}</div>
					<div className="link__title">{location.title}</div>
					{!!(locationPath.time > 0) && <div className="link__time">({unavailabilityReason ? unavailabilityReason.short : timeToString(locationPath.time)})</div>}
				</div>
			);
		})}
	</div>);
};
