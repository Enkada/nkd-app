import React, { useState } from 'react'
import { SetStat, Stat } from '../App';
import html2canvas from 'html2canvas';
import { formatMoney, timeToString } from '../Utils';
import { LOCATIONS } from '../types/Location';
import { ACTIONS } from '../types/Action';
import { CHARACTERS } from '../types/Character';

export const SaveLoad = ({ stat, gameRef, setStat }: {
    stat: Stat,
    setStat: SetStat,
    gameRef: React.RefObject<HTMLDivElement>
}) => {
    type SaveData = {
        version: number;
        slots: Record<number, Stat & { screenshot: string | null }>;
    }  

    const { setLocation, setAction, setCharacter, setDay, setMoney, setEnergy, setFood, setTime, setStorages, setSeenActions, setVariables } = setStat;

    const getSaveData = (): SaveData => {

        const getDefaultSave = () => {
            return {
                version: 1,
                slots: {}
            } as SaveData;
        }

        const json = localStorage.getItem(`save`);

        if (!json) return getDefaultSave();

        const saveData: SaveData = JSON.parse(json) as SaveData;
        console.log(saveData)

        if (saveData?.version) {
            return saveData;
        }
        return getDefaultSave();
    }

    const [saveData, setSaveData] = useState<SaveData>(getSaveData());

    const handleSaveInSlot = async (index: number) => {
        const newSaveData = {...saveData};
        newSaveData.slots[index] = {
            ...stat,
            screenshot: await takeScreenshot()
        }
        localStorage.setItem(`save`, JSON.stringify(newSaveData));
        setSaveData(newSaveData);
    }

    const handleDeleteSlot = (index: number) => {
        const newSaveData = {...saveData};
        delete newSaveData.slots[index];
        localStorage.setItem(`save`, JSON.stringify(newSaveData));
        setSaveData(newSaveData);
    }

    async function takeScreenshot() {
        if (gameRef.current) {
            const screenshot = await html2canvas(gameRef.current);

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;

            canvas.height = 86;
            canvas.width = (86 * screenshot.width) / screenshot.height;
            context.drawImage(screenshot, 0, 0, canvas.width, canvas.height);

            return new Promise<string | null>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64Data = reader.result as string;
                            resolve(base64Data);
                        };
                        reader.readAsDataURL(blob);
                    } else {
                        resolve(null);
                    }
                }, 'image/jpeg', 0.3);
            });
        }

        return null;
    }

    const handleLoadSave = (stat: Stat & { screenshot: string | null }) => {        
        setLocation(LOCATIONS[stat.location.id]);
        setAction(stat.action ? ACTIONS[stat.action.id] : null);
        setCharacter(stat.character ? CHARACTERS[stat.character.id] : null);
        setDay(stat.day);
        setMoney(stat.money);
        setEnergy(stat.energy);
        setFood(stat.food);
        setTime(stat.time);
        setStorages(stat.storages);
        setSeenActions(stat.seenActions);
        setVariables(stat.variables);
    }

    return (
        <div className="save-load__slot-list">
            {Array.from(Array(10)).map((_, i) => {
                const slot = saveData.slots[i];
                //console.log(slot?.screenshot.slice(-10));

                return (<div className="save-load__slot" key={Math.random()}>
                    <div className="save-load__slot__index">{i + 1}</div>
                    {slot?.screenshot ? <img src={slot.screenshot}/> : <div className="save-load__slot__image placeholder"></div>}
                    {slot ? 
                    <div className="save-load__slot__data">Day {slot.day}, {timeToString(slot.time)}, {slot.location.title}, {formatMoney(slot.money)}$</div>
                    : <div className="save-load__slot__data">No data</div>}
                    <div className="save-load__slot__btn-list">
                        <button onClick={() => handleSaveInSlot(i)}>Save</button>
                        {!!slot && <button onClick={() => handleLoadSave(slot)}>Load</button>}
                        {!!slot && <button onClick={() => handleDeleteSlot(i)}>Delete</button>}
                    </div>
                </div>)
            })}
        </div>
    )
}
