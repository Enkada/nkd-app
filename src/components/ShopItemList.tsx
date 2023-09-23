import { ItemPrice } from '../types/Item';
import { Shop } from '../types/Shop';
import { Stat } from '../App';

export const ShopItemList = ({
	shop, stat, handleItemClick
}: {
	shop: Shop;
	stat: Stat;
	handleItemClick: (item: ItemPrice) => void;
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
	);
};
