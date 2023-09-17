import { useRef, useEffect } from 'react'

export const Background = ({
    current, 
    old
} : {
    current?:string, 
    old?:string
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
	}, [current]);

    return (
        <>
            <img src={`/place/${current}`} className='background background--current' />
			<img src={`/place/${old}`} ref={bgRef} className='background background--old' />
        </>
    )
}
