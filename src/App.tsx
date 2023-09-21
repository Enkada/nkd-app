import { useEffect, useRef, useState } from 'react'
import { GetRecordWithIds, t, getRandom, rand, timeToString } from './Utils';
import { Location, LocationPath, Reason, _LOCATIONS } from './Location';
import { Action, _ACTIONS } from './Action';
import { Character, _CHARACTERS } from './Character';
import { Background } from './Background';
import { PCScreen } from './pc/PCScreen';
import { ItemPrice, Shop, ItemStorage, Item, ITEMS } from './Items';
import Draggable from 'react-draggable';

const ACTIONS = GetRecordWithIds(_ACTIONS);
const LOCATIONS = GetRecordWithIds(_LOCATIONS);
const CHARACTERS = GetRecordWithIds(_CHARACTERS);

const energyLossMultiplier = 8;
const foodLossMultiplier = 6;

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
				unavailability = location.unavailability(stat.time, getDayOfTheWeek(getDate(stat.day)));
			}

			return (
				// YES THE KEY IS RANDOM
				<div key={location.id} className={`link location ${unavailability ? "ignored" : ""}`} onClick={unavailability ? () => { } : () => handleLocationChange(locationPath)} style={{ "--index": initialIndex + index } as React.CSSProperties}>
					<div className="link__emoji">{location.emoji}</div>
					<div className="link__title">{location.title}</div>
					{!!(locationPath.time > 0) && <div className="link__time">({unavailability ? unavailability.short : timeToString(locationPath.time)})</div>}
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
				key={character.id}
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

			if (stat.food.self.current < Math.floor((action.time || 0) / (foodLossMultiplier + (action.isRest ? 4 : 0)))) {
				ignoreReason = "too hungry";
			}
			if (action.time && !action.isRest && (stat.energy.current < (Math.floor(action.time / energyLossMultiplier) + (action.cost?.energy || 0)))) {
				ignoreReason = "no energy";
			}
			else if (stat.money < (action.cost?.money || 0)) {
				ignoreReason = "not enough money";
			}

			// YES THE KEY IS RANDOM
			return (<div
				key={actionId}
				className={`link action ${ignoreReason ? "ignored" : ""}`}
				onClick={ignoreReason ? () => { } : () => handleAction(action)}
				style={{ "--index": initialIndex + index } as React.CSSProperties}
			>
				<div className="link__emoji">{action.emoji}</div>
				<div className="link__title">{action.title}</div>
				{!!(action.time || 0 > 0) && (<div className="link__time">({ignoreReason ? ignoreReason : timeToString(action.time || 0)})</div>)}
				{!!action.cost && <div className='link__cost-list'>
					{!!action.cost.energy && (action.cost.energy > 0 ? <div className='link__cost bad'>-Energy</div> : <div className='link__cost good'>+Energy</div>)}
					{!!action.cost.money && <div className='link__cost bad'>-{action.cost.money}$</div>}
				</div>}
			</div>);
		})}
	</div>);
}

const ShopItemList = ({ 
	shop,
	stat,
	handleItemClick
}: { 
	shop: Shop,
	stat: Stat,
	handleItemClick: (item: ItemPrice) => void
}) => {
	return (
		<div className="shop">{shop.items.map((item, index) => (
			<div 
				key={index} 
				className={`item ${stat.money >= item.price ? "" : "no-money"}`} 
				style={{ "--index": index } as React.CSSProperties} 
				onClick={stat.money >= item.price ? () => handleItemClick(item) : () => { }}
			>
				<div className="item__emoji">{item.item.emoji}</div>	
				<div className="item__name">{item.item.name}</div>
				<div className="item__price">{item.price.toFixed(2).replace('.00', '')} $</div>
				<div className="item__own">x{stat.storages.self.find(x => x.id === item.item.id)?.count || 0}</div>
			</div>))}
		</div>
	)
}

type ProgressBar = {
	current: number;
	max: number;
}

export type Stat = {
    day: number;
    money: number;
    energy: {
        current: number;
        max: number;
    },
	food: {
		sara: ProgressBar,
		self: ProgressBar
	},
	time: number,
	storages: Record<string, ItemStorage>
}

export type StatKeys = "day" | "money" | "energy" | "time";

const getDate = (day: number): Date => {
	return new Date(new Date(2000, 8, 23).getTime() + (day - 1) * 86400000);
}

const getDayOfTheWeek = (date: Date): number => {
	return date.getDay() - 1;
}

const initialLocation = LOCATIONS.subway_train;
const initialAction = ACTIONS.intro_0;
// const initialLocation = LOCATIONS.home;
// const initialAction = null;

export type LocationBackground = {
	image?: string,
	items: string[]
}

function App() {

	const [location, setLocation] = useState<Location>(initialLocation);
	const [action, setAction] = useState<Action | null>(initialAction);
	const [character, setCharacter] = useState<Character | null>(null);

	// TODO: Move to Background.tsx
	const [prevBackground, setPrevBackground] = useState<LocationBackground>({
		image: initialLocation.image,
		items: []
	});

	const [day, setDay] = useState(1);
	const [money, setMoney] = useState(5);
	const [energy, setEnergy] = useState({ current: 90, max: 100 });
	const [food, setFood] = useState({
		sara: { current: 90, max: 100 },
		self: { current: 90, max: 100 }
	})
	const [time, setTime] = useState(t(8, 0));
	const [storages, setStorages] = useState<Record<string, ItemStorage>>({
		self: [{...ITEMS.hotdog, count: 1}, {...ITEMS.apple, count: 3}],
		home: []
	});	

	const [isInventoryOpen, setIsInventoryOpen] = useState(false);
	const [isStorageOpen, setIsStorageOpen] = useState(false);

	const stat: Stat = {
		day: day,
		money: money,
		energy: energy,
		food: food,
		time: time,
		storages: storages
	}

	const [extraContent, setExtraContent] = useState<JSX.Element[]>([]);

	const [showPCScreen, setShowPCScreen] = useState(false);

	const getLocationItems = (): string[] => {
		if (!storages[location.id as string]) return [];
		return storages[location.id as string].filter(x => x.type === "location").map(x => x.id as string);
	}

	const handleLocationChange = (path: LocationPath) => {
		handleTimeChange(path.time);

		setExtraContent([]);

		// Location logic
		switch (path.id) {
			case "pc":
				setShowPCScreen(true);
				break;
		}

		setPrevBackground({ image: location.image, items: getLocationItems() });
		setLocation(LOCATIONS[path.id]);
	}

	const handlePCExit = () => {
		setShowPCScreen(false);
		setLocation(LOCATIONS.home);
	}

	const handleCharacterSelect = (character: Character | null) => {
		setCharacter(character);
	}

	const handleTimeChange = (minutes: number, isRest?: boolean) => {
		const saraLocation = 'availability' in CHARACTERS.sara ? CHARACTERS.sara.availability(time, getDayOfTheWeek(getDate(day))) : "";
		
		setTime(prev => prev + minutes);

		if (food.sara.current <= 20 && saraLocation !== null && storages[saraLocation] && storages[saraLocation].length) {
			const storage = [...storages[saraLocation]];
			let foodChange = 0;
			let index = storage.findIndex(x => x.type === "food");

			console.log('Sara is hungry', index);

			while (index != -1 && storage[index] && food.sara.current <= 50) {
				if (index == -1 || !storage[index]) break;

				foodChange += storage[index].hunger || 0;
				console.log('Sara ate', storage[index].name);
				
				storage[index].count--;

				if (storage[index].count <= 0) {
					storage.splice(index, 1);
				}

				index = storage.findIndex(x => x.type === "food");
			};	
			
			addFood('sara', foodChange);

			setStorages({ ...storages, [saraLocation]: storage });
		}

		if (food.sara.current <= 0) {
			console.log('Sara is VERY hungry');
		}

		if (!isRest) {
			addEnergy(-Math.floor(minutes / energyLossMultiplier));
			addFood('self', -Math.floor(minutes / foodLossMultiplier));
			addFood('sara', -Math.floor(minutes / foodLossMultiplier));
		}
		else {
			addEnergy(Math.floor(minutes / (energyLossMultiplier - 2)));
			addFood('self', -Math.floor(minutes / (foodLossMultiplier + 4)));
			addFood('sara', -Math.floor(minutes / (foodLossMultiplier + 4)));
		}
	}

	const addFood = (key: "sara" | "self", value: number) => {
		setFood((prev) => ({
			...prev, [key]: { ...prev[key], current: Math.min(Math.max(prev[key].current + value, 0), prev[key].max) }
		}))
	}

	const addEnergy = (value: number) => {
		setEnergy((prev) => ({
			...prev, current: Math.min(Math.max(prev.current + value, 0), prev.max) 
		}));
	}

	const handleAction = (action: Action | null) => {
		setAction(action);

		if (action) {
			handleTimeChange(action?.time || 0, action.isRest);

			setMoney((prev) => prev - (action.cost?.money || 0));
			setEnergy((prev) => ({
				...prev, current: Math.min(Math.max(prev.current - (action.cost?.energy || 0), 0), prev.max) 
			}));

			if (action.location) {
				handleLocationChange({ id: action.location, time: t(0, 0) });
			}

			if (action.character !== undefined) {
				handleCharacterSelect(action.character === null ? null : CHARACTERS[action.character]);
			}

			let index = 0;
			setExtraContent([]);

			// Action logic
			switch (action.id) {
				case "work":
					if (rand(1, 10) <= 7) { // 70%
						let money = rand(1, 6);

						setMoney((prev) => prev + money);

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
			const text = getRandom(action.text, time);
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
			const greetings = getRandom(character.greetings, time);

			const actions = character.actions ? [...character.actions] : [];

			switch (location.id) {
				case "subway":
					actions.push("intro_2");
					break;
			}

			return (
				<>
					{!!greetings && <p>{greetings}</p>}
					{!!actions.length && <ActionLinkList actions={actions} handleAction={handleAction} stat={stat} />}
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
			let description = getRandom(location.descriptions, time);

			let unavailability: string[] = []

			const characters = Object.values(CHARACTERS).filter(x => 'availability' in x && x.availability(time, getDayOfTheWeek(getDate(stat.day))) == location.id);

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

			let actions = [...(location.actions || [])];

			// Combine parents and chilren - locations - and check if they are unavailable
			parents.concat(children || []).forEach(locationPath => {
				const location = LOCATIONS[locationPath.id];
				if (location.unavailability) {
					const isUnavailable = location.unavailability(time, getDayOfTheWeek(getDate(day)));
					if (isUnavailable !== null) {
						unavailability.push(getRandom(isUnavailable.full));
					}
				}
			});

			switch (location.id) {
				case "subway":
					characters.push(CHARACTERS.sara);
					break;
				case "home":
					if (!storages.home.find(x => x.id === "mattress")) {
						actions = actions.filter(x => x != "sleep");
					}
					break;
			}

			return (
				<>
					{!!description && <p>{description}</p>}
					{!!extraContent.length && extraContent}
					{!!unavailability.length && <div className='location-unavailabilty-reason-list'>
						{unavailability.map((reason, index) => (<div key={Math.random() * (index + 1)} >{reason}</div>))}
					</div>}
					{!!characters.length && <CharacterLinkList characters={characters} handleCharacterSelect={handleCharacterSelect} />}
					{!!actions.length && <ActionLinkList actions={actions} initialIndex={characters.length} handleAction={handleAction} stat={stat} />}
					{!!children?.length && <LocationLinkList paths={children} stat={stat} initialIndex={(actions.length || 0) + characters.length} handleLocationChange={handleLocationChange} />}
					{!!parents.length && <LocationLinkList paths={parents} stat={stat} initialIndex={(children?.length || 0) + (actions.length || 0) + characters.length} handleLocationChange={handleLocationChange} />}
					{!!location.shop && <ShopItemList stat={stat} handleItemClick={handleItemClick} shop={location.shop}/>}
				</>
			);
		}
	}

	const handleItemClick = (item: ItemPrice) => {
		if (money >= item.price) {
			const index = storages.self.findIndex(x => x.id === item.item.id);

			if (index !== -1) {
				const newItems = [...storages.self];
				newItems[index].count++;
				setStorages({ ...storages, self: newItems });
			}
			else {
				setStorages({ ...storages, self: [...storages.self, { ...item.item, count: 1 }] });
			}

			setMoney((prev) => prev - item.price);
		}
	}

	const handleItemUse = (item: Item & { count: number }, storageKey: string, food: "self" | "sara" = "self") => {
		const storage = storages[storageKey];
		const index = storage.findIndex(x => x.id === item.id);

		switch (item.type) {
			case "food":
				const newItems = [...storage];
				newItems[index].count--;

				if (newItems[index].count <= 0) {
					newItems.splice(index, 1);
				}

				setStorages({ ...storages, [storageKey]: newItems });

				setFood((prev) => ({
					...prev, [food]: { ...prev[food], current: Math.min(Math.max(prev[food].current + (item.hunger || 0), 0), prev[food].max) }
				}));
				break;
		
			default:
				break;
		}
	}

	const handleExportItem = (item: Item & { count: number }, from: string, to: string) => {
		const fromStorage = storages[from];
		const fromIndex = fromStorage.findIndex(x => x.id === item.id);

		const newItems = [...fromStorage];
		newItems[fromIndex].count--;

		if (newItems[fromIndex].count <= 0) {
			newItems.splice(fromIndex, 1);
		}

		setStorages((prev) => ({ ...prev, [from]: newItems }));

		const toStorage = storages[to];
		const toIndex = toStorage.findIndex(x => x.id === item.id);

		if (toIndex !== -1) {
			const newItems = [...toStorage];
			newItems[toIndex].count++;			
			setStorages((prev) => ({ ...prev, [to]: newItems }));
		}
		else {
			setStorages((prev) => ({ ...prev, [to]: [...toStorage, { ...item, count: 1 }] }));
		}
	}

	const contentRef = useRef<HTMLDivElement>(null);
	const [contentHeight, setElementHeight] = useState(200);

	useEffect(() => {
		if (contentRef.current) {
			setElementHeight(contentRef.current.offsetHeight);
		}

		// Adds a day if time is more than 23:59
		if (time >= 24 * 60) {
			setDay(prev => prev + Math.floor(time / (24 * 60)));
			setTime(time % (24 * 60))
		}
	});

	return (
		<div className="game">
			<div className="preload">
				{Object.values(LOCATIONS).map((location, index) => (
					<img key={index} src={`/place/${location.image}`} />
				))}
			</div>
			<Background current={{ image: location.image, items: getLocationItems() }} old={prevBackground} />
			<div className="info-bar">
				<div className='info-bar__left'>
					<div className="stat date" title={`Day ${day}`}>{getDate(day).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
					<div className="stat money"><span className='emoji'>💳</span> {money.toFixed(2).replace('.00', '')} $</div>
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
				<div className="stat location">{location.title}</div>
			</div>
			<div className="menu">
				<div className="btn" data-title='Inventory' onClick={() => setIsInventoryOpen(!isInventoryOpen)}>💼</div>
				{!!(Object.keys(storages).includes(location.id as string)) && <div className="btn" data-title={`${location.title} Storage`} onClick={() => setIsStorageOpen(!isStorageOpen)}>📦</div>}
			</div>
			{!!isInventoryOpen && <Draggable handle=".window__top-bar">
			<div className="inventory storage window">
				<div className="window__top-bar">
					<div className="window__top-bar__title">💼 Inventory</div>
					<div className="window__top-bar__btn-list">
						<div className="btn btn-close" onClick={() => setIsInventoryOpen(false)}>X</div>
					</div>
				</div>
				<div className="storage__item-list">
				{storages.self.map((item, index) => (
					<div key={index} className='item'>
						<div className="item__emoji">{item.emoji}</div>	
						<div className="item__count">x{item.count}</div>
						{!!(item.type === "food") && <div className="btn btn-use" onClick={() => handleItemUse(item, "self")}>🍽️</div>}
						{!!(Object.keys(storages).includes(location.id as string)) && <div className="btn btn-export" onClick={() => handleExportItem(item, "self", location.id as string)}>📥</div>}
					</div>
				))}
				</div>
			</div>
			</Draggable>}			
			{!!(isStorageOpen && !!(Object.keys(storages).includes(location.id as string))) && <Draggable handle=".window__top-bar">
			<div className="location storage window">
				<div className="window__top-bar">
					<div className="window__top-bar__title">📦 {location.title} Storage</div>
					<div className="window__top-bar__btn-list">
						<div className="btn btn-close" onClick={() => setIsStorageOpen(false)}>X</div>
					</div>
				</div>
				<div className="storage__item-list">
				{(storages[location.id as string] || []).map((item, index) => (
					<div key={index} className='item'>
						<div className="item__emoji">{item.emoji}</div>	
						<div className="item__count">x{item.count}</div>
						{!!(item.type === "food") && <div className="btn btn-use" onClick={() => handleItemUse(item, location.id as string)}>🍽️</div>}
						<div className="btn btn-export" onClick={() => handleExportItem(item, location.id as string, "self")}>📤</div>
					</div>
				))}
				</div>
			</div>
			</Draggable>}
			{showPCScreen
			? <PCScreen handlePCExit={handlePCExit} /> :
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
