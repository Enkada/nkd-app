import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LOCATIONS, Location, LocationPath } from '../types/Location';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    emoji: string;
    children: LocationPath[];
}

interface Link extends d3.SimulationLinkDatum<Node> {
    distance: number;
    source: string;
    target: string;
}

export const Map = ({
    location
}: {
    location: Location
}) => {
    const data = Object.values(LOCATIONS);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const nodes: Node[] = data.map((location: Location) => ({
            ...location,
            children: location.children || [],
            x: width / 2,
            y: height / 2
        }));

        const links: Link[] = data.flatMap((location: Location) =>
            (location.children || []).map((child) => ({
                source: location.id,
                target: child.id,
                distance: 20 + child.time * 5,
                time: child.time
            }))
        );

        const simulation = d3
            .forceSimulation<Node, Link>(nodes)
            .force('link', d3.forceLink<Node, Link>()
                .id((d) => d.id)
                .links(links)
                .distance((d) => d.distance)
            )
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2 + 180, height / 2 - 300))

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

        link
            .append('text')
            .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
            .attr('y', (d: any) => (d.source.y + d.target.y) / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .attr('class', 'time')
            .text((d: any) => d.time == 0 ? '' : d.time);

        const node = svg
            .selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('data-id', d => d.id)
            .attr('class', 'node');

        node
            .append('text')
            .attr('dy', '.25em')
            .attr('text-anchor', 'middle')
            .attr('class', 'emoji')
            .text((d: Node) => d.emoji);

        node
            .append('text')
            .attr('dy', '1.75em')
            .attr('text-anchor', 'middle')
            .attr('class', 'title')
            .text((d: Node) => LOCATIONS[d.id].title);

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
    }, []);

    useEffect(() => {
        const nodes = document.querySelectorAll('.node');

        nodes.forEach((node) => {
            node.classList.remove('current');
            if (node.getAttribute('data-id') == location.id) {
                node.classList.add('current');
            }
        })
    }, [location.id])


    return (
        <svg ref={svgRef}></svg>
    );
};

export default Map;
