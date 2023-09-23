import { Character } from '../types/Character';

export const CharacterLinkList = ({
	characters, handleCharacterSelect, initialIndex = 0
}: {
	characters: Character[];
	handleCharacterSelect: (character: Character) => void;
	initialIndex?: number | 0;
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
};
