import { timeToString, isBetween } from '../Utils';
import { ACTIONS, Action, ConditionalAction } from '../types/Action';
import { Stat, foodLossMultiplier, energyLossMultiplier } from '../App';

export const ActionLinkList = ({
	actions, handleAction, initialIndex = 0, stat
}: {
	actions: (string | ConditionalAction)[];
	handleAction: (action: Action) => void;
	initialIndex?: number | 0;
	stat: Stat;
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
	};

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
};
