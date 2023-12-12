import { t, getRandom, rand, isBetween, randPow, formatText, checkConditions } from '../Utils';
import { LocationPath, LOCATIONS } from '../types/Location';
import { Action } from '../types/Action';
import { Character, CHARACTERS } from '../types/Character';
import { ItemPrice } from '../types/Item';
import { LocationLinkList } from './LocationLinkList';
import { CharacterLinkList } from './CharacterLinkList';
import { ActionLinkList } from './ActionLinkList';
import { ShopItemList } from './ShopItemList';
import { Stat, SetStat } from '../App';
import { BusLinkList } from './BusLinkList';

export const Content = ({
	stat, setStat, handleAction, handleCharacterSelect, handleItemPurchase, handleLocationChange, handleActionOnce
}: {
	stat: Stat;
	setStat: SetStat;
	handleAction: (action: Action | null) => void;
	handleCharacterSelect: (character: Character | null) => void;
	handleItemPurchase: (item: ItemPrice) => void;
	handleLocationChange: (path: LocationPath) => void;
	handleActionOnce: (f: () => any) => void;
}) => {

	const {
		location, action, character, time, storages
	} = stat;

	const {
		setMoney
	} = setStat;

	const createContentLine = (text: string | string[], index: number = 0): JSX.Element => {
		if (Array.isArray(text)) {
			text = getRandom(text, time);
		}

		return <p key={index} dangerouslySetInnerHTML={{ __html: formatText(text) }}></p>;
	};

	const getContentLineIndex = (text: string | string[]): number => {
		if (Array.isArray(text)) {
			text = getRandom(text, time);
		}

		return (text.match(/[a-b]: (.*)/g) || []).length;
	};


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

		const characters = Object.values(CHARACTERS).filter(x => checkConditions(x.conditions, stat, true)?.location == location.id);

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

		let busStops = location.id.startsWith("bus_stop_") ? parents.concat(children).filter(x => x.id.startsWith("bus_stop_")) : [];

		let actions = [...(location.actions || [])];

		// Combine parents and chilren - locations - and check if they are unavailable
		parents.concat(children).forEach(locationPath => {
			const location = LOCATIONS[locationPath.id];
			const unavailabilityReason = checkConditions(location.conditions, stat)?.reason;

			if (unavailabilityReason) {
				unavailability.push(getRandom(unavailabilityReason.full));
			}
		});

		switch (location.id) {
			case "subway":
				characters.push(CHARACTERS.sara);
				break;
			case "sara_home":
				if (!storages.sara_home.find(x => x.id === "mattress")) {
					actions = actions.filter(x => x != "bed");
				}
				if (characters.find(x => x.name == "Sara") && !isBetween(time, t(2, 0), t(7, 30))) {
					actions = actions.filter(x => x != "work_freelance");
					children = children.filter(x => x.id != "sara_pc");

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
					{unavailability.map((reason, index) => (<div key={Math.random() * (index + 1)}>{reason}</div>))}
				</div>}
				{!!characters.length && <CharacterLinkList characters={characters} handleCharacterSelect={handleCharacterSelect} />}
				{!!actions.length && <ActionLinkList actions={actions} initialIndex={characters.length} handleAction={handleAction} stat={stat} />}
				{!!busStops.length && <BusLinkList paths={busStops} handleLocationChange={handleLocationChange} initialIndex={characters.length + actions.length}/>}
				{!!children.length && <LocationLinkList paths={children} stat={stat} initialIndex={actions.length + characters.length + busStops.length} handleLocationChange={handleLocationChange} />}
				{!!parents.length && <LocationLinkList paths={parents} stat={stat} initialIndex={actions.length + characters.length + busStops.length + children.length} handleLocationChange={handleLocationChange} />}
				{!!location.shop && <ShopItemList stat={stat} handleItemClick={handleItemPurchase} shop={location.shop} />}
			</>
		);
	}
};
