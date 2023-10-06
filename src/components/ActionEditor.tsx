import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { ACTIONS, Action } from '../types/Action';
import Draggable from 'react-draggable';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    emoji?: string;
    actions: string[];
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
}

const ActionGraph = ({
    actions,
    handleActionSelect
}: {
    actions: Record<string, Action>;
    handleActionSelect: (_: any, d: Node) => void;
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const data = Object.values(actions);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const nodes: Node[] = data.map((action: Action) => ({
            ...action,
            actions: action.actions || [],
            x: width / 2,
            y: height / 2
        }));

        const links: Link[] = data.flatMap((action: Action) =>
            (action.actions || []).map((child) => ({
                source: action.id,
                target: child
            }))
        );

        const simulation = d3
            .forceSimulation<Node, Link>(nodes)
            .force('link', d3.forceLink<Node, Link>()
                .id((d) => d.id)
                .links(links)
                .distance(35)
            )
            .force('charge', d3.forceManyBody().strength(-6).distanceMax(10))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(15));

        const svg = d3.select(svgRef.current);

        const link = svg
            .selectAll('.link')
            .data(links)
            .enter()
            .append('g')
            .attr('class', 'link');

        link
            .append('line')
            .attr('class', 'line')
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);

        const node = svg
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('data-id', d => d.id)
            .attr('id', d => d.id)
            .attr('class', 'node');

        node
            .append('text')
            .attr('dy', '.25em')
            .attr('text-anchor', 'middle')
            .attr('class', 'emoji')
            .attr('id', d => d.id)
            .on('click', handleActionSelect)
            .text((d: any) => d.emoji ?? "✖️");

        node
            .append('text')
            .attr('dy', '1.75em')
            .attr('text-anchor', 'middle')
            .attr('class', 'title')
            .text((d: Node) => d.id);

        node.call(d3.drag<SVGGElement, Node, SVGSVGElement>()
            .on('drag', (event, d) => {
                d.x = event.x;
                d.y = event.y;
                simulation.restart();
            })
        );

        simulation.on('tick', () => {
            link.select('.line')
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            link.select('text')
                .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
                .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

            node.attr('transform', (d: Node) => `translate(${d.x},${d.y})`);
        });

    }, [actions]);

    return (
        <svg ref={svgRef}></svg>
    )
}

export const ActionEditor = () => {


    const [actions, setActions] = useState(ACTIONS);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
    const [updateGraph, setUpdateGraph] = useState(0);
    const [inputId, setInputId] = useState("");
    const [newActionId, setNewActionId] = useState("");
    const [asChild, setAsChild] = useState(false);

    const handleActionSelect = useCallback(
        (_: any, d: Node) => {
            setSelectedActionId(d.id);
        },
        [],
    );

    useEffect(() => {
        document.querySelectorAll('.modified').forEach((el) => {
            el.classList.remove('modified');
        });

        if (!selectedActionId) return;

        const nodes = document.querySelectorAll('.node');

        nodes.forEach((node) => {
            node.classList.remove('current');
        })

        document.getElementById(selectedActionId)?.classList.add('current');

        setSelectedAction(actions[selectedActionId]);
        setInputId(selectedActionId);
    }, [selectedActionId]);

    useEffect(() => {
        if (!selectedActionId) return;
        document.getElementById(selectedActionId)?.classList.add('current');
    }, [updateGraph]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (selectedAction) {
            const { name, value, type } = event.target;

            event.target.classList.add('modified');

            if (name === 'text') {
                setSelectedAction({ ...selectedAction, text: value.split('\n---\n') });
            }
            else if (name === 'actions') {
                if (value.trim().length === 0) {
                    setSelectedAction({ ...selectedAction, actions: undefined });
                }
                else {
                    setSelectedAction({ ...selectedAction, actions: value.split(',') });
                }
            }
            else if (name === 'money' || name === 'energy' || name === 'food') {
                let cost = selectedAction.cost || {};
                cost[name] = Number(value) === 0 ? undefined : Number(value);
                const isCostEmpty = cost.money === undefined && cost.energy === undefined && cost.food === undefined;
                setSelectedAction({ ...selectedAction, cost: isCostEmpty ? undefined : cost });
            }
            else if (name === 'm') {
                console.log(selectedAction.time, value);
                const time = Math.floor((selectedAction.time || 0) / 60) * 60 + Number(value);
                setSelectedAction({ ...selectedAction, time: time === 0 ? undefined : time });
            }
            else if (name === 'h') {
                const time = Number(value) * 60 + (selectedAction.time || 0) % 60;
                setSelectedAction({ ...selectedAction, time: time === 0 ? undefined : time });
            }
            else if (type === 'checkbox') {
                setSelectedAction({ ...selectedAction, [name]: (event.currentTarget as HTMLInputElement).checked });
            } else {
                setSelectedAction({ ...selectedAction, [name]: value !== '' ? value : undefined });;
            }
        }
    };

    const handleActionSave = () => {
        if (!selectedAction) return;

        setActions({ ...actions, [selectedAction.id]: selectedAction });
        
        if (selectedAction.emoji !== actions[selectedAction.id].emoji) {
            setUpdateGraph(updateGraph + 1);
        }
    }

    const handleCreateAction = () => {
        if (!newActionId.trim().length) return;

        if (asChild) {
            if (!selectedAction) return;

            setActions({
                ...actions,
                [newActionId]: { id: newActionId, text: [], emoji: "🆕" },
                [selectedAction.id]: { ...selectedAction, actions: [...(selectedAction.actions || []), newActionId] }
            });
        }
        else {
            setActions({ ...actions, [newActionId]: { id: newActionId, text: [], emoji: "🆕" } });
        }

        setUpdateGraph(updateGraph + 1);
        setSelectedActionId(newActionId);
        setNewActionId("");
        setAsChild(false);
    }

    const handleIdChange = () => {
        if (!selectedAction) return;

        // Change ID in action.actions
        const newActions: Record<string, Action> = Object.fromEntries(
            Object.entries(actions).map(([key, action]) => [
                key,
                { ...action, actions: action.actions?.map(child => (child === selectedAction.id ? inputId : child)) },
            ])
        );

        delete newActions[selectedAction.id];
        selectedAction.id = inputId;
        newActions[inputId] = selectedAction;

        setActions(newActions);
        setUpdateGraph(updateGraph + 1);
    }

    const json = useMemo(() => {
        const actionsWithoutIds = Object.fromEntries(Object.entries(actions).map(([key, action]) => [key, { ...action, id: undefined }]));

        const fixTime = (match: string) => {
            const time = parseFloat(match.split(' ')[1]);
            return `time: t(${Math.floor(time / 60)}, ${time % 60})`;
        }

        return `import { t } from "../Utils";\n` +
            `import { Action } from "./Action";\n\n` +
            `export const _ACTIONS: Record<string, Omit<Action, 'id'>> = ` +
            JSON.stringify(actionsWithoutIds, null, 4)
                .replace(/\s{4}"(.*?)":\s/g, '    $1: ')
                .replace(/time: (\d+)/g, fixTime);
    }, [actions]);

    return (
        <div className="action-editor">
            <button className="btn btn-update" onClick={() => setUpdateGraph(updateGraph + 1)}>Update Graph</button>
            <div className="new-action">
                <input type="text" placeholder='New Action' value={newActionId} onChange={(e) => setNewActionId(e.target.value)} />
                <button onClick={handleCreateAction}>Create</button>
                {!!selectedAction && <label><input type="checkbox" checked={asChild} onChange={(e) => setAsChild(e.currentTarget.checked)} /> as child of selected</label>}
            </div>
            
                <div className="action-editor__graph">
                    <Draggable>
                        <div className="action-editor__graph__wrapper">
                            <ActionGraph key={updateGraph} actions={actions} handleActionSelect={handleActionSelect} />
                        </div>
                    </Draggable>
                </div>
            
            <div className="action-editor__editor-form">
                <div className="action-editor__editor-form__wrapper">
                    {!!selectedAction && <>
                    <div className="row">
                        <input name='id' type="text" value={inputId} onChange={(e) => setInputId(e.target.value)} />
                        <button onClick={handleIdChange}>Change ID</button>
                    </div>
                    <div className="row">
                        <input name='title' type="text" value={selectedAction.title || ""} onChange={handleInputChange} />
                        <input name='emoji' className='emoji' type="text" value={selectedAction.emoji} onChange={handleInputChange} />
                    </div>
                    <div className="row time">
                        <label>t(</label>
                        <input name='h' type="text" value={Math.floor((selectedAction.time || 0) / 60)} onChange={handleInputChange} />
                        <label>,</label>
                        <input name='m' type="text" value={(selectedAction.time || 0) % 60} onChange={handleInputChange} />
                        <label>)</label>
                    </div>
                    <textarea name='text' rows={10} value={selectedAction.text.join('\n---\n')} onChange={handleInputChange} />
                    <textarea name='actions' placeholder='Actions' rows={1} value={selectedAction.actions ?? ''} onChange={handleInputChange} />
                    <div className="row cost">
                        <input name='money' placeholder='Money' type="text" value={selectedAction.cost?.money ?? ""} onChange={handleInputChange} />
                        <input name='energy' placeholder='Energy' type="text" value={selectedAction.cost?.energy ?? ""} onChange={handleInputChange} />
                        <input name='food' placeholder='Food' type="text" value={selectedAction.cost?.food ?? ""} onChange={handleInputChange} />
                    </div>
                    <div className="row">
                        <input name='character' type="text" placeholder='Character' value={selectedAction.character ?? ""} onChange={handleInputChange} />
                        <input name='location' type="text" placeholder='Location' value={selectedAction.location ?? ""} onChange={handleInputChange} />
                    </div>
                    <div className="row">
                        <label><input name='hideReturn' type="checkbox" checked={selectedAction.hideReturn || false} onChange={handleInputChange} /> Hide return</label>
                        <label><input name='isRest' type="checkbox" checked={selectedAction.isRest || false} onChange={handleInputChange} /> Is Rest</label>
                    </div>
                    <div className="row return">
                        <input name='returnEmoji' className='emoji' type="text" value={selectedAction.returnEmoji ?? ""} onChange={handleInputChange} />
                        <input name='returnText' placeholder='Return Text' type="text" value={selectedAction.returnText ?? ""} onChange={handleInputChange} />
                    </div>
                    <button onClick={handleActionSave}>Save</button>
                    <textarea readOnly rows={20} value={JSON.stringify(selectedAction, null, 4)}></textarea>
                    </>}
                    <textarea readOnly className='action-editor__output' value={json}></textarea>
                </div>
            </div>
        </div>
    );
};

export default Map;
