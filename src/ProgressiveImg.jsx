import React, { useEffect, useState } from 'react'

export default function ProgressiveImg({ src, ...props }) {
	const [imgSrc, setImgSrc] = useState(src.replace('\/files\/', '\/thumbnails\/'));

	useEffect(() => {
		const img = new Image();
		img.src = src;
		img.onload = () => {
			setImgSrc(src);
		};
	}, [src]);

	const customClass = imgSrc === src.replace('\/files\/', '\/thumbnails\/') ? "loading" : "loaded";

	return (
		<img
			{...{ src: imgSrc, ...props }}
			alt={props.alt || ""}
			className={`progressive ${customClass}`}
		/>
	);
};