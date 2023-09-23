import { useEffect, useRef, useState } from 'react'
import { t, getDayOfTheWeek, getDate, formatText } from './Utils';
import { Location, LocationPath, LOCATIONS } from './types/Location';
import { Action } from './types/Action';
import { Character, CHARACTERS } from './types/Character';
import { Background } from './components/Background';
import { PCScreen } from './pc/PCScreen';
import { ItemPrice, ItemStorage, Item, ITEMS } from './types/Item';
import { DraggableWindow } from './components/DraggableWindow';
import { InfoBar } from './components/InfoBar';
import { Content } from './components/Content';
import { NotificationList } from './components/NotificationList';

export const energyLossMultiplier = 8;
export const foodLossMultiplier = 6;

type ProgressBar = {
	current: number;
	max: number;
}

export type Stat = {
	location: Location;
	action: Action | null;
	character: Character | null;
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
	storages: Record<string, ItemStorage>,
	seenActions: string[]
}

export type SetStat = {
    setLocation: React.Dispatch<React.SetStateAction<Location>>;
    setAction: React.Dispatch<React.SetStateAction<Action | null>>;
    setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
	setDay: React.Dispatch<React.SetStateAction<number>>;
	setMoney: React.Dispatch<React.SetStateAction<number>>;
	setEnergy: React.Dispatch<React.SetStateAction<{
		current: number;
		max: number;
	}>>;
	setFood: React.Dispatch<React.SetStateAction<{
		sara: ProgressBar;
		self: ProgressBar;
	}>>;
	setTime: React.Dispatch<React.SetStateAction<number>>;
	setStorages: React.Dispatch<React.SetStateAction<Record<string, ItemStorage>>>;
	setSeenActions: React.Dispatch<React.SetStateAction<string[]>>;
}

// const initialLocation = LOCATIONS.subway_train;
// const initialAction = ACTIONS.intro_0;
const initialLocation = LOCATIONS.home;
const initialAction = null;

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
		self: [
			{...ITEMS.sandwich, count: 1}, 
			{...ITEMS.apple, count: 3}
		],
		home: [
			{...ITEMS.sandwich, count: 2}, 
			{...ITEMS.apple, count: 5},
			{...ITEMS.cookie, count: 10},
		],
		college: [{...ITEMS.canteen_lunch, count: 99999}],
	});	
	const [seenActions, setSeenActions] = useState<string[]>([]);

	const [isInventoryOpen, setIsInventoryOpen] = useState(false);
	const [isStorageOpen, setIsStorageOpen] = useState(false);
	const [isWaitMenuOpen, setIsWaitMenuOpen] = useState(false);
	const [waitValue, setWaitValue] = useState(5);
	const [notifications, setNotifications] = useState<string[]>([]);
	const [gameOverMessage, setGameOverMessage] = useState("");

	const stat: Stat = {
		location: location,
		action: action,
		character: character,
		day: day,
		money: money,
		energy: energy,
		food: food,
		time: time,
		storages: storages,
		seenActions: seenActions,
	}

	const setStat: SetStat = {
		setLocation: setLocation,
		setAction: setAction,
		setCharacter: setCharacter,
		setDay: setDay,
		setMoney: setMoney,
		setEnergy: setEnergy,
		setFood: setFood,
		setTime: setTime,
		setStorages: setStorages,
		setSeenActions: setSeenActions
	}

	const [showPCScreen, setShowPCScreen] = useState(false);

	const getLocationItems = (): string[] => {
		if (!storages[location.id]) return [];
		return storages[location.id].filter(x => x.type === "location").map(x => x.id);
	}

	const handleLocationChange = (path: LocationPath) => {
		handleTimeChange(path.time);

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
		const saraLocation = CHARACTERS.sara.availability ? CHARACTERS.sara.availability(time, getDayOfTheWeek(getDate(day))) : "";
		
		setTime(prev => prev + minutes);		

		const foodLoss = isRest ? -Math.floor(minutes / (foodLossMultiplier + 4)) : -Math.floor(minutes / foodLossMultiplier);

		if ((food.sara.current + foodLoss) <= 10) showNotification(`⚠️ Sara is hungry`);

		if ((food.sara.current + foodLoss) <= 20 && saraLocation !== null && storages[saraLocation] && storages[saraLocation].length) {
			const storage = [...storages[saraLocation]];
			let foodGain = 0;
			let index = storage.findIndex(x => x.type === "food");

			while (index != -1 && storage[index] && (food.sara.current + foodLoss + foodGain) <= 50) {
				if (index == -1 || !storage[index]) break;

				foodGain += storage[index].hunger || 0;				
				showNotification(`Sara ate ${storage[index].emoji} ${storage[index].name}`);
				
				storage[index].count--;

				if (storage[index].count <= 0) {
					storage.splice(index, 1);
				}

				index = storage.findIndex(x => x.type === "food");
			};	
			
			addFood('sara', foodGain);

			setStorages({ ...storages, [saraLocation]: storage });
		}

		if (food.self.current <= 10) showNotification(`⚠️ You are hungry`);
		if (energy.current <= 5) showNotification(`⚠️ You are exhausted`);
		
		if (food.sara.current <= -20) setGameOverMessage(`Sara died from hunger`);
		else if (food.self.current <= -20) setGameOverMessage(`You died of hunger`);
		else if (energy.current <= -20) setGameOverMessage(`You died from exhaustion`);

		if (!isRest) {
			addEnergy(-Math.floor(minutes / energyLossMultiplier));
			addFood('self', foodLoss);
			addFood('sara', foodLoss);
		}
		else {
			addEnergy(Math.floor(minutes / (energyLossMultiplier - 2)));
			addFood('self', foodLoss);
			addFood('sara', foodLoss);
		}
	}

	const addFood = (key: "sara" | "self", value: number) => {
		setFood((prev) => ({
			...prev, [key]: { ...prev[key], current: Math.min(prev[key].current + value, prev[key].max) }
		}))
	}

	const addEnergy = (value: number) => {
		setEnergy((prev) => ({
			...prev, current: Math.min(prev.current + value, prev.max) 
		}));
	}

	const handleAction = (action: Action | null) => {
		setAction(action);
		setIsWaitMenuOpen(false);

		if (action) {
			setSeenActions([...seenActions, action.id]);
			handleTimeChange(action?.time || 0, action.isRest);

			setMoney((prev) => prev - (action.cost?.money || 0));
			setEnergy((prev) => ({
				...prev, current: Math.min(prev.current - (action.cost?.energy || 0), prev.max) 
			}));
			setFood((prev) => ({
				...prev, self: { ...prev.self, current: Math.min(prev.self.current - (action.cost?.food || 0), prev.self.max) }
			}))

			if (action.location) {
				handleLocationChange({ id: action.location, time: t(0, 0) });
			}

			if (action.character !== undefined) {
				handleCharacterSelect(action.character === null ? null : CHARACTERS[action.character]);
			}
		}
	}	

	const handleActionOnce = (f: () => any) => {
		if (!action?.isHandled) {
			// setTimeout is used to prevent race condition between App and Content
			setTimeout(() => {
				f();
				const newAction = {...action};
				newAction.isHandled = true;
				setAction(newAction as Action);
			}, 0);
		}
	}
	
	const showNotification = (text: string) => {
		setNotifications((prev) => [...prev, text]);
	}	

	const handleItemPurchase = (item: ItemPrice) => {
		if (money >= (item.price - 0.01)) {
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
					...prev, [food]: { ...prev[food], current: Math.min(prev[food].current + (item.hunger || 0), prev[food].max) }
				}));
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
			<InfoBar stat={stat}/>
			<div className="menu">
				{!!(action === null && character === null && energy.current > 0) && <div className="btn" data-title="Wait" onClick={() => setIsWaitMenuOpen(!isWaitMenuOpen)}>⏳</div>}
				<div className="btn" data-title='Inventory' onClick={() => setIsInventoryOpen(!isInventoryOpen)}>💼</div>
				{!!(Object.keys(storages).includes(location.id)) && <div className="btn" data-title={`${location.title} Storage`} onClick={() => setIsStorageOpen(!isStorageOpen)}>📦</div>}
			</div>
			<NotificationList notifications={notifications}/>
			{!!(isWaitMenuOpen && action === null && character === null && energy.current > 0) && <DraggableWindow className='wait' onClose={() => setIsWaitMenuOpen(false)} title={`⏳ Wait`}>
				<div className="wait__form">
					<input type="range" value={waitValue} min={1} max={120} onChange={e => setWaitValue(parseInt(e.target.value))}/>
					<div className="wait__value">{waitValue} minute{!!(waitValue !== 1) && "s"}</div>
					<button onClick={() => handleTimeChange(waitValue)}>Wait</button>
				</div>
			</DraggableWindow>}
			{!!isInventoryOpen && <DraggableWindow className='inventory storage' onClose={() => setIsInventoryOpen(false)} title={`💼 Inventory`}>
				<div className="storage__item-list">
				{storages.self.map((item, index) => (
					<div key={index} className='item'>
						<div className="item__emoji">{item.emoji}</div>	
						<div className="item__count">x{item.count}</div>
						{!!(item.type === "food") && <div className="btn btn-use" onClick={() => handleItemUse(item, "self")}>🍽️</div>}
						{!!(Object.keys(storages).includes(location.id)) && <div className="btn btn-export" onClick={() => handleExportItem(item, "self", location.id)}>📥</div>}
					</div>
				))}
				</div>
			</DraggableWindow>}	
			{!!(isStorageOpen && !!(Object.keys(storages).includes(location.id))) && 
			<DraggableWindow
				className='location storage'
				onClose={() => setIsStorageOpen(false)}
				title={`📦 ${location.title} Storage`}
			>
				<div className="storage__item-list">
				{(storages[location.id] || []).map((item, index) => (
					<div key={index} className='item'>
						<div className="item__emoji">{item.emoji}</div>	
						<div className="item__count">x{item.count}</div>
						{!!(item.type === "food") && <div className="btn btn-use" onClick={() => handleItemUse(item, location.id)}>🍽️</div>}
						<div className="btn btn-export" onClick={() => handleExportItem(item, location.id, "self")}>📤</div>
					</div>
				))}
				</div>
			</DraggableWindow>}
			{showPCScreen ? <PCScreen handlePCExit={handlePCExit} /> :
			<div className="content-wrapper">
				{!!character && <img className="character" style={{ shapeOutside: `url(/character/${character.id}.png)` }} src={`/character/${character.id}.png`} />}
				<div className="height-fix" style={{ "--height": contentHeight + "px" } as React.CSSProperties}></div>
				<div className="content" ref={contentRef}>
					<Content
						stat={stat}
						setStat={setStat}
						handleAction={handleAction}
						handleCharacterSelect={handleCharacterSelect}
						handleItemPurchase={handleItemPurchase}
						handleLocationChange={handleLocationChange}
						handleActionOnce={handleActionOnce}
					/>
				</div>
			</div>}
			{!!gameOverMessage && <div className="game-over__wrapper">
				<div className="game-over">
					<div className="game-over__title">GAME OVER</div>
					<div className="game-over__message">{gameOverMessage}</div>	
				</div>
			</div>}
		</div>
	);
}

export default App