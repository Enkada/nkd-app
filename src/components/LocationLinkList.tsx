import { timeToString, getDayOfTheWeek, getDate } from '../Utils';
import { LocationPath, Reason, LOCATIONS } from '../types/Location';
import { Stat } from '../App';

export const LocationLinkList = ({
	paths, handleLocationChange, initialIndex = 0, stat
}: {
	paths: LocationPath[];
	handleLocationChange: (path: LocationPath) => void;
	initialIndex?: number | 0;
	stat: Stat;
}) => {

	return (<div className='link-list'>
		{paths.map((locationPath, index) => {
			const location = LOCATIONS[locationPath.id];

			let unavailability: Reason | null = null;
			if (location.unavailability) {
				unavailability = location.unavailability(stat.time, getDayOfTheWeek(getDate(stat.day)));
			}

			return (
				<div key={location.id} className={`link location ${unavailability ? "ignored" : ""}`} onClick={unavailability ? () => { } : () => handleLocationChange(locationPath)} style={{ "--index": initialIndex + index } as React.CSSProperties}>
					<div className="link__emoji">{location.emoji}</div>
					<div className="link__title">{location.title}</div>
					{!!(locationPath.time > 0) && <div className="link__time">({unavailability ? unavailability.short : timeToString(locationPath.time)})</div>}
				</div>
			);
		})}
	</div>);
};
