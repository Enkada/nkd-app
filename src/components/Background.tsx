import { useRef, useEffect } from 'react'
import { LocationBackground } from '../App';

export const Background = ({
    current, 
    old
} : {
    current?: LocationBackground, 
    old?: LocationBackground
}) => {
    const bgRef = useRef<HTMLImageElement>(null);	

    useEffect(() => {
		if (bgRef.current) {
			// Add the animation class to trigger it
			bgRef.current.classList.add('anim');
	
			// Remove the animation class after the animation completes
			bgRef.current.addEventListener('animationend', () => {
				bgRef.current?.classList.remove('anim');
				bgRef.current?.classList.add('animated');
			});
		}
	}, [current?.image]);

    return (
        <>
            <img src={`/place/${current?.image}`} className='background background--current' />          
			<div>{current?.items.map((item, index) => <img key={index} className='background-item background-item--current' src={`/place/item/${item}.png`}/>)}</div>
			<img src={`/place/${old?.image}`} ref={bgRef} className='background background--old' />
			<div>{old?.items.map((item, index) => <img key={index} className='background-item background-item--old' src={`/place/item/${item}.png`}/>)}</div>
        </>
    )
}
