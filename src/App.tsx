import { useEffect, useRef, useState } from 'react'
import { GetRecordWithIds, Time, getRandom, rand } from './Utils';
import { Location, LocationPath, Reason, _LOCATIONS } from './Location';
import { Action, _ACTIONS } from './Action';
import { Character, _CHARACTERS } from './Character';
import { Background } from './Background';
import { PCScreen } from './pc/PCScreen';

const ACTIONS = GetRecordWithIds(_ACTIONS);
const LOCATIONS = GetRecordWithIds(_LOCATIONS);
const CHARACTERS = GetRecordWithIds(_CHARACTERS);

const energyLossMultiplier = 8;

const LocationLinkList = ({
	paths,
	handleLocationChange,
	initialIndex = 0,
	stat
}: {
	paths: LocationPath[],
	handleLocationChange: (path: LocationPath) => void,
	initialIndex?: number | 0,
	stat: Stat
}) => {

	return (<div className='link-list'>
		{paths.map((locationPath, index) => {
			const location = LOCATIONS[locationPath.id];

			let unavailability: Reason | null = null;
			if (location.unavailability) {
				unavailability = location.unavailability(stat.time.value, 0)
			}

			return (
				// YES THE KEY IS RANDOM
				<div key={Math.random() * (index + 1)} className={`link location ${unavailability ? "ignored" : ""}`} onClick={unavailability ? () => { } : () => handleLocationChange(locationPath)} style={{ "--index": initialIndex + index } as React.CSSProperties}>
					<div className="link__emoji">{location.emoji}</div>
					<div className="link__title">{location.title}</div>
					{!!(locationPath.time.value > 0) && <div className="link__time">({unavailability ? unavailability.short : locationPath.time.toString()})</div>}
				</div>
			);
		})}
	</div>);
}

const CharacterLinkList = ({
	characters,
	handleCharacterSelect,
	initialIndex = 0
}: {
	characters: Character[],
	handleCharacterSelect: (character: Character) => void,
	initialIndex?: number | 0
}) => {

	return (<div className='link-list'>
		{characters.map((character, index) => (
			// YES THE KEY IS RANDOM
			<div
				key={Math.random() * (index + 1)}
				className='link character'
				onClick={() => handleCharacterSelect(character)}
				style={{ "--index": initialIndex + index } as React.CSSProperties}
			>
				<div className="link__emoji">💬</div>
				<div className="link__title">{character.name}</div>
			</div>
		))}
	</div>);
}

const ActionLinkList = ({
	actions,
	handleAction,
	initialIndex = 0,
	stat
}: {
	actions: string[],
	handleAction: (action: Action) => void,
	initialIndex?: number | 0,
	stat: Stat
}) => {

	return (<div className='link-list'>
		{actions.map((actionId, index) => {
			const action = ACTIONS[actionId];

			let ignoreReason = "";

			if (action.time?.value && !action.isRest && (stat.energy.current < (Math.floor(action.time?.value / energyLossMultiplier) + (action.cost?.energy || 0)))) {
				ignoreReason = "no energy";
			}
			else if (stat.money < (action.cost?.money || 0)) {
				ignoreReason = "not enough money";
			}

			// YES THE KEY IS RANDOM
			return (<div
				key={Math.random() * (index + 1)}
				className={`link action ${ignoreReason ? "ignored" : ""}`}
				onClick={ignoreReason ? () => { } : () => handleAction(action)}
				style={{ "--index": initialIndex + index } as React.CSSProperties}
			>
				<div className="link__emoji">{action.emoji}</div>
				<div className="link__title">{action.title}</div>
				{!!(action.time?.value || 0 > 0) && (<div className="link__time">({ignoreReason ? ignoreReason : action.time?.toString()})</div>)}
				{!!action.cost && <div className='link__cost-list'>
					{!!action.cost.energy && (action.cost.energy > 0 ? <div className='link__cost bad'>-Energy</div> : <div className='link__cost good'>+Energy</div>)}
					{!!action.cost.money && <div className='link__cost bad'>-{action.cost.money}$</div>}
				</div>}
			</div>);
		})}
	</div>);
}

export type Stat = {
    day: number;
    money: number;
    energy: {
        current: number;
        max: number;
    },
	time: Time
}

export type StatKeys = "day" | "money" | "energy" | "energy.current" | "time";

function App() {

	const [location, setLocation] = useState<Location>(LOCATIONS.your_home);
	const [action, setAction] = useState<Action | null>(null);
	const [character, setCharacter] = useState<Character | null>(null);

	// TODO: Move to Background.tsx
	const [prevBackground, setPrevBackground] = useState(LOCATIONS.your_home.image);

	const [stat, _setStat] = useState<Stat>({
		day: 1,
		money: 5,
		energy: { current: 90, max: 100 },
		time: new Time(5, 30)
	});

	const setStat = (
		key: "day" | "money" | "energy" | "energy.current" | "time",
		value: any,
		action: "=" | "=>" = "=>"
	) => {
		if (key === "time") {
			_setStat((prev) => ({ ...prev, time: new Time(value) }));
		}
		else if (key === "energy.current") {
			_setStat((prev) => ({
				...prev, energy: { ...prev.energy,
					current: Math.min(Math.max(prev.energy.current - value, 0), prev.energy.max)
				}
			}));
		}
		else {
			switch (action) {
				case "=>":
					_setStat((prev) => ({ ...prev, [key]: prev[key] + value }));
					break;
				case "=":
					_setStat((prev) => ({ ...prev, [key]: value }));
					break;
			}
		}
	}

	const [extraContent, setExtraContent] = useState<JSX.Element[]>([]);

	const [showPCScreen, setShowPCScreen] = useState(false)

	const handleLocationChange = (path: LocationPath) => {
		handleTimeChange(path.time.value);

		setExtraContent([]);

		// Location logic
		switch (path.id) {
			case "your_pc":
				setShowPCScreen(true);
				break;
		}

		setPrevBackground(location.image);
		setLocation(LOCATIONS[path.id]);
	}

	const handlePCExit = () => {
		setShowPCScreen(false);
		setLocation(LOCATIONS.your_home);
	}

	const handleCharacterSelect = (character: Character | null) => {
		setCharacter(character);
	}

	const handleTimeChange = (minutes: number, isRest?: boolean) => {
		setStat("time", stat.time.value + minutes)

		if (!isRest) {
			subtractEnergy(Math.floor(minutes / energyLossMultiplier));
		}
		else {
			subtractEnergy(-Math.floor(minutes / (energyLossMultiplier + 2)));
		}
	}

	const subtractEnergy = (value: number) => {
		setStat("energy.current", value);
	}

	const handleAction = (action: Action | null) => {
		setAction(action);

		if (action) {
			handleTimeChange(action?.time?.value || 0, action.isRest);

			setStat("money", -(action.cost?.money || 0));
			subtractEnergy(action.cost?.energy || 0);

			let index = 0;
			setExtraContent([]);

			// Action logic
			switch (action.id) {
				case "work":
					if (rand(1, 10) <= 7) { // 70%
						let money = rand(1, 6);

						setStat("money", money)

						setExtraContent(prev => [...prev, <p key={index++}>{getRandom([
							`You've managed to get ${money}$ for a hour of work.`,
							`You've just got ${money}$.`,
						])}</p>]);

					}
					else {
						setExtraContent(prev => [...prev, <p key={index++}>{getRandom([
							`You've spent a whole hour and haven't found any job to do.`,
							`After wasting an hour you haven't found a task to do.`,
						])}</p>]);
					}
					break;
			}
		}
		else {
			// Reset content if action is null
			setExtraContent([]);
		}
	}

	const getContent = () => {
		if (action) {
			// Action
			const text = getRandom(action.text);
			const actions = action.actions;

			return (
				<>
					{!!text && <p>{text}</p>}
					{!!extraContent.length && extraContent}
					{!!actions?.length && <ActionLinkList actions={actions} handleAction={handleAction} stat={stat} />}
					{!!(!action.hideReturn) && <div className='link-list'>
						<div key={Math.random()} className='link action' onClick={() => handleAction(null)} style={{ "--index": actions?.length || 0 } as React.CSSProperties}>
							<div className="link__emoji">{action.returnEmoji ?? "◀"}</div>
							<div className="link__title">{action.returnText ?? "Return"}</div>
						</div>
					</div>}
				</>
			);
		}
		else if (character) {
			// Character
			const greetings = getRandom(character.greetings);

			const actions = character.actions;
			return (
				<>
					{!!greetings && <p>{greetings}</p>}
					{!!actions?.length && <ActionLinkList actions={actions} handleAction={handleAction} stat={stat} />}
					<div className='link-list'>
						<div key={Math.random()} className='link action' onClick={() => handleCharacterSelect(null)} style={{ "--index": actions?.length || 0 } as React.CSSProperties}>
							<div className="link__emoji">👋🏻</div>
							<div className="link__title">Goodbye, {character.name}</div>
						</div>
					</div>
				</>
			);
		}
		else {
			// Location
			let description = getRandom(location.descriptions);

			let unavailability: string[] = []

			const characters = Object.values(CHARACTERS).filter(x => 'availability' in x && x.availability(stat.time.value, 0) == location.id);

			const children = location.children;
			const parents = Object.entries(LOCATIONS).reduce<LocationPath[]>((parentLocations, [key, value]) => {
				if (value.children?.some(child => child.id === location.id)) {
					value.children.forEach(child => {
						if (child.id === location.id) {
							parentLocations.push({ id: key, time: child.time });
						}
					});
				}
				return parentLocations;
			}, []);

			const actions = location.actions;

			// Combine parents and chilren - locations - and check if they are unavailable
			parents.concat(children || []).forEach(locationPath => {
				const location = LOCATIONS[locationPath.id];
				if (location.unavailability) {
					const isUnavailable = location.unavailability(stat.time.value, 0);
					if (isUnavailable !== null) {
						unavailability.push(getRandom(isUnavailable.full));
					}
				}
			});

			return (
				<>
					{!!description && <p>{description}</p>}
					{!!extraContent.length && extraContent}
					{!!unavailability.length && <div className='location-unavailabilty-reason-list'>
						{unavailability.map((reason, index) => (<div key={Math.random() * (index + 1)} >{reason}</div>))}
					</div>}
					{!!characters.length && <CharacterLinkList characters={characters} handleCharacterSelect={handleCharacterSelect} />}
					{!!actions?.length && <ActionLinkList actions={actions} initialIndex={characters.length} handleAction={handleAction} stat={stat} />}
					{!!children?.length && <LocationLinkList paths={children} stat={stat} initialIndex={(actions?.length || 0) + characters.length} handleLocationChange={handleLocationChange} />}
					{!!parents.length && <LocationLinkList paths={parents} stat={stat} initialIndex={(children?.length || 0) + (actions?.length || 0) + characters.length} handleLocationChange={handleLocationChange} />}
				</>
			);
		}
	}

	const contentRef = useRef<HTMLDivElement>(null);
	const [contentHeight, setElementHeight] = useState(200);

	useEffect(() => {
		if (contentRef.current) {
			setElementHeight(contentRef.current.offsetHeight);
		}

		// Adds a day if time is more than 23:59
		if (stat.time.value >= 24 * 60) {
			setStat("day", Math.floor(stat.time.value / (24 * 60)))
			setStat("time", stat.time.value % (24 * 60));
		}
	});

	return (
		<div className="game">
			<div className="preload">
				{Object.values(LOCATIONS).map((location, index) => (
					<img key={index} src={`/place/${location.image}`} />
				))}
			</div>
			<Background current={location.image} old={prevBackground} />
			<div className="info-bar">
				<div className='info-bar__left'>
					<div className="stat date" title={`Day ${stat.day}`}>{new Date(new Date(2000, 8, 20).getTime() + (stat.day - 1) * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
					<div className="stat money"><span className='emoji'>💳</span> {stat.money} $</div>
					<div className="stat energy">
						<span className='emoji'>⚡</span>
						<progress max={stat.energy.max} value={stat.energy.current} />
					</div>
				</div>
				<div className="stat time">{stat.time.toString()}</div>
				<div className="stat location">{location.title}</div>
			</div>
			{showPCScreen
				? <PCScreen setStat={setStat} handlePCExit={handlePCExit} /> :
				<div className="content-wrapper">
					{!!character && <img className="character" style={{ shapeOutside: `url(/character/${character.id}.png)` }} src={`/character/${character.id}.png`} />}
					<div className="height-fix" style={{ "--height": contentHeight + "px" } as React.CSSProperties}></div>
					<div className="content" ref={contentRef}>
						{getContent()}
					</div>
				</div>}
		</div>
	);
}

export default App
