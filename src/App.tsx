import { useEffect, useRef, useState } from 'react'
import { GetRecordWithIds, t, getRandom, rand, timeToString, isBetween, randPow } from './Utils';
import { Location, LocationPath, Reason, _LOCATIONS } from './Location';
import { Action, ConditionalAction, _ACTIONS } from './Action';
import { Character, _CHARACTERS } from './Character';
import { Background } from './Background';
import { PCScreen } from './pc/PCScreen';
import { ItemPrice, Shop, ItemStorage, Item, ITEMS } from './Items';
import { DraggableWindow } from './DraggableWindow';

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
	actions: (string | ConditionalAction)[],
	handleAction: (action: Action) => void,
	initialIndex?: number | 0,
	stat: Stat
}) => {

	const checkConditionalAction = (conditionalAction: ConditionalAction) => {
		let isPassed = true;
		if (conditionalAction.seenActions && !conditionalAction.seenActions.every(x => stat.seenActions.includes(x))) {
			isPassed = false;
		}
		if (conditionalAction.unseenActions && !conditionalAction.unseenActions.every(x => !stat.seenActions.includes(x))) {
			isPassed = false;
		}
		if (conditionalAction.time && !isBetween(stat.time, conditionalAction.time.from, conditionalAction.time.to)) {
			isPassed = false;
		}
		return isPassed ? conditionalAction.action : null;
	}

	return (<div className='link-list'>
		{actions.map((actionItem, index) => {
			const actionId = typeof actionItem === "string" ? actionItem : checkConditionalAction(actionItem);
			
			if (!actionId) {
				return null;
			}

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
				className={`item ${stat.money >= (item.price - 0.01) ? "" : "no-money"}`} 
				style={{ "--index": index } as React.CSSProperties} 
				onClick={stat.money >= (item.price - 0.01) ? () => handleItemClick(item) : () => { }}
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
	storages: Record<string, ItemStorage>,
	seenActions: string[]
}

export type StatKeys = "day" | "money" | "energy" | "time";

const getDate = (day: number): Date => {
	return new Date(new Date(2000, 8, 23).getTime() + (day - 1) * 86400000);
}

const getDayOfTheWeek = (date: Date): number => {
	const day = date.getDay();
	return day === 0 ? 6 : day;
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
		day: day,
		money: money,
		energy: energy,
		food: food,
		time: time,
		storages: storages,
		seenActions: seenActions,
	}

	const [showPCScreen, setShowPCScreen] = useState(false);

	const getLocationItems = (): string[] => {
		if (!storages[location.id as string]) return [];
		return storages[location.id as string].filter(x => x.type === "location").map(x => x.id as string);
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
		const saraLocation = 'availability' in CHARACTERS.sara ? CHARACTERS.sara.availability(time, getDayOfTheWeek(getDate(day))) : "";
		
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
			setSeenActions([...seenActions, action.id as string]);
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
			f();
			const newAction = {...action};
			newAction.isHandled = true;
			setAction(newAction as Action);
		}
	}

	const formatText = (text: string): string => {
		text = text.replace(/a: (.*)/g, '<span class="line self-line">$1</span>');
		text = text.replace(/b: (.*)/g, '<span class="line character-line">$1</span>');
		text = text.replace(/\n/g, '<br>');
		text = text.replace(/Sara/g, '<span class="sara">Sara</span>');
		text = text.replace(/\d+(\.\d+)?\$/g, "<span class='money'>$&</span>");
		text = text.replace(/(?<!\*)\*([^*]*?)\*(?!\*)/g, '<span class="subtext">$1</span>');

		return text;
	}

	const createContentLine = (text: string | string[], index: number = 0): JSX.Element => {	
		if (Array.isArray(text)) {
			text = getRandom(text, time);
		}	

		return <p key={index} dangerouslySetInnerHTML={{ __html: formatText(text) }}></p>;
	}

	const getContentLineIndex = (text: string | string[]): number => {
		if (Array.isArray(text)) {
			text = getRandom(text, time);
		}

		return (text.match(/[a-b]: (.*)/g) || []).length;
	}

	const showNotification = (text: string) => {
		setNotifications((prev) => [...prev, text]);
	}

	const getContent = () => {
		if (action) {
			// Action
			const text = getRandom(action.text, time);
			const actions = action.actions;

			let index = 0;
			const extra: JSX.Element[] = [];

			// Action logic
			switch (action.id) {
				case "work_freelance":					
					if (rand(1, 10, time + 1) <= 7) { // 70%
						let money = randPow(5, 20, time);

						handleActionOnce(() => {
							setMoney((prev) => prev + money);	
						});

						extra.push(createContentLine([
							`You've managed to get ${money}$ for a hour of work.`,
							`You've just got ${money}$.`
						], index++));
					}
					else {
						extra.push(createContentLine([
							`You've spent a whole hour and haven't found any job to do.`,
							`After wasting an hour you haven't found a task to do.`,
						], index++));
					}
					break;
				case "work_burger_king":
					let money = randPow(5 * 8, 12 * 8, time);

					console.log(5 * 8, 12 * 8, money);

					handleActionOnce(() => {
						setMoney((prev) => prev + money);	
					});

					extra.push(createContentLine([
						`You've managed to get ${money}$ for 8 hours of work.`,
						`You've just got ${money}$.`
					], index++));
					break;
			}

			return (
				<>
					{!!text && createContentLine(text)}
					{!!extra.length && extra}
					{!!actions?.length && <ActionLinkList initialIndex={getContentLineIndex(text) * 40} actions={actions} handleAction={handleAction} stat={stat} />}
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

			let actions = character.actions ? [...character.actions] : [];

			switch (location.id) {
				case "subway":
					actions = ["intro_greeting"];
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
			let unavailability: string[] = [];
			
			let index = 0;
			const extra: JSX.Element[] = [];

			const characters = Object.values(CHARACTERS).filter(x => 'availability' in x && x.availability(time, getDayOfTheWeek(getDate(stat.day))) == location.id);

			let children: LocationPath[] = location.children ? [...location.children] : [];
			let parents = Object.entries(LOCATIONS).reduce<LocationPath[]>((parentLocations, [key, value]) => {
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
			parents.concat(children).forEach(locationPath => {
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
						actions = actions.filter(x => x != "bed");
					}
					if (characters.find(x => x.name == "Sara") && !isBetween(time, t(2, 0), t(7, 30))) {
						actions = actions.filter(x => x != "work_freelance");
						children = children.filter(x => x.id != "pc");

						extra.push(createContentLine([
							'Sara is using the laptop.',
						], index++));
					}
					break;
			}

			return (
				<>
					{!!location.descriptions?.length && createContentLine(location.descriptions)}
					{!!extra.length && extra}
					{!!unavailability.length && <div className='location-unavailabilty-reason-list'>
						{unavailability.map((reason, index) => (<div key={Math.random() * (index + 1)} >{reason}</div>))}
					</div>}
					{!!characters.length && <CharacterLinkList characters={characters} handleCharacterSelect={handleCharacterSelect} />}
					{!!actions.length && <ActionLinkList actions={actions} initialIndex={characters.length} handleAction={handleAction} stat={stat} />}
					{!!children.length && <LocationLinkList paths={children} stat={stat} initialIndex={(actions.length || 0) + characters.length} handleLocationChange={handleLocationChange} />}
					{!!parents.length && <LocationLinkList paths={parents} stat={stat} initialIndex={(children.length || 0) + (actions.length || 0) + characters.length} handleLocationChange={handleLocationChange} />}
					{!!location.shop && <ShopItemList stat={stat} handleItemClick={handleItemClick} shop={location.shop}/>}
				</>
			);
		}
	}

	const handleItemClick = (item: ItemPrice) => {
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
				<div className="stat location">{location.title}</div>
			</div>
			<div className="menu">
				{!!(action === null && character === null && energy.current > 0) && <div className="btn" data-title="Wait" onClick={() => setIsWaitMenuOpen(!isWaitMenuOpen)}>⏳</div>}
				<div className="btn" data-title='Inventory' onClick={() => setIsInventoryOpen(!isInventoryOpen)}>💼</div>
				{!!(Object.keys(storages).includes(location.id as string)) && <div className="btn" data-title={`${location.title} Storage`} onClick={() => setIsStorageOpen(!isStorageOpen)}>📦</div>}
			</div>
			<div className="notification-list">
				{notifications.map((notification, index) => (
					<div key={index} className="notification-wrapper">
						<div className="notification" dangerouslySetInnerHTML={{ __html: formatText(notification) }}></div>
					</div>
				))}
			</div>
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
						{!!(Object.keys(storages).includes(location.id as string)) && <div className="btn btn-export" onClick={() => handleExportItem(item, "self", location.id as string)}>📥</div>}
					</div>
				))}
				</div>
			</DraggableWindow>}	
			{!!(isStorageOpen && !!(Object.keys(storages).includes(location.id as string))) && 
			<DraggableWindow
				className='location storage'
				onClose={() => setIsStorageOpen(false)}
				title={`📦 ${location.title} Storage`}
			>
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
			</DraggableWindow>}
			{showPCScreen ? <PCScreen handlePCExit={handlePCExit} /> :
			<div className="content-wrapper">
				{!!character && <img className="character" style={{ shapeOutside: `url(/character/${character.id}.png)` }} src={`/character/${character.id}.png`} />}
				<div className="height-fix" style={{ "--height": contentHeight + "px" } as React.CSSProperties}></div>
				<div className="content" ref={contentRef}>
					{getContent()}
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
