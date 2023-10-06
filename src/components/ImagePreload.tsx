import React, { useState, useMemo, useEffect } from 'react'
import { LOCATIONS } from '../types/Location'
import { CHARACTERS } from '../types/Character'

export const ImagePreload = ({ setIsLoading }: {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const [loadedImages, setLoadedImages] = useState(0);

    const handleImageLoad = () => {
        setLoadedImages((prevLoadedImages) => prevLoadedImages + 1);
    };

    useEffect(() => {
        //console.log(loadedImages, images.length);
        if (loadedImages === images.length) {
            setIsLoading(false);
        }
    }, [loadedImages])
    

    const images = useMemo(() => {
        const places = Object.values(LOCATIONS).flatMap(location => Object.values(location.image)).map(image => `/place/${image}`);
        const characters = Object.values(CHARACTERS).filter(character => character.image).flatMap(character => character.image && Object.keys(character.image).map(image => `/character/${character.id}_${image}.png`));

        return [...places, ...characters];
    }, [])

    return (
        <div className="preload">
            {images.map((image, index) => (
                <img key={index} src={image} onLoad={handleImageLoad} />
            ))}
        </div>
    )
}
