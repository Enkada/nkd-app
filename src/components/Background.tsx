import { useEffect, useState, useMemo } from 'react'
import { Location } from '../types/Location';
import { Stat } from '../App';
import { isBetween, t } from '../Utils';


export const Background = ({ stat }: { stat: Stat }) => {
	const { time, storages, location } = stat;

	const getLocationItems = (location: Location): string[] => {
		if (!storages[location.id]) return [];
		return storages[location.id].filter(x => x.type === "location").map(x => x.id);
	}

	const [prevImage, setPrevImage] = useState<string>(location.image.day);
	const [prevItems, setPrevItems] = useState<string[]>([]);
	const [prevTime, setPrevTime] = useState<number>(time);

	useEffect(() => {
		setPrevItems(getLocationItems(location));
		setPrevImage(getImage(location, time));
	}, [location])

	const isNight = (time: number) => {
		return isBetween(time, t(21, 0), t(24, 0)) || isBetween(time, t(0, 0), t(5, 59))
	}

	const isTwilight = (time: number) => {
		return isBetween(time, t(6, 0), t(7, 59)) || isBetween(time, t(18, 0), t(20, 59))
	}

	const getPeriod = (time: number): "night" | "twilight" | "day" => {
		if (isNight(time)) {
			return "night";
		}
		else if (isTwilight(time)) {
			return "twilight";
		}
		else {
			return "day";
		}
	}

	const [updateMemo, setUpdateMemo] = useState<number>(0);

	useEffect(() => {
		const isSamePeriod = getPeriod(time) === getPeriod(prevTime);
		const locationHasImage = location.image[getPeriod(time)];

		if (!isSamePeriod && locationHasImage) {
			setPrevImage(getImage(location, prevTime));
			setUpdateMemo(updateMemo + 1);
		}

		setPrevTime(time);
	}, [time])

	const getImage = (location: Location, time: number) => {
		let image = location.image.day;

		if (isNight(time)) {
			image = location.image.night ?? image;
		}
		else if (isTwilight(time)) {
			image = location.image.twilight ?? image;
		}

		return image;
	}

	// useMemo is used to prevent rendering the wrong image
	const backgroundGroups = useMemo(() => {
		return (<>
			<div className="background-group background-group--current">
				<img src={`/place/${getImage(location, time)}`} className='background' />
				{getLocationItems(location).map((item, index) => (
					<img key={index} className='background-item' src={`/place/item/${item}.png`} />
				))}
			</div>
			{!!prevImage &&
				<div key={location.id + time} className="background-group background-group--old">
					<img src={`/place/${prevImage}`} className='background' />
					{prevItems.map((item, index) => (
						<img key={index} className='background-item' src={`/place/item/${item}.png`} />
					))}
				</div>}
		</>)
	}, [location, storages, updateMemo])

	return backgroundGroups;
}
