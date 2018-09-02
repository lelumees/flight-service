'use strict';

const _ = require('lodash');
const PriorityQueue = require('priorityqueue');


const { flightsDb } = require('../connection');

const SOURCE_AIRPORT = 'TLL';
const GRAPH = {};
const shortestPaths = {};
const visitedNodes = [];

const getRoutes = () => {
    return flightsDb
        .select(
            'id',
            'distance',
            { 'sourceAirport': 'source_airport' },
            { 'destinationAirport': 'destination_airport' },
            { 'sourceAirportId': 'source_airport_id' },
            { 'destinationAirportId': 'destination_airport_id' }
        )
        .from('routes')
        .whereNot('distance', null);
};

const traverse = (source, previousDistance, previousNodes) => {
    const routes = GRAPH[source];

    const priorityQueue = new PriorityQueue({
        comparator: (a, b) => a.distance - b.distance
    });

    // Push routes to list
    for (const destination in routes) {
        const distance = routes[destination];
        const totalDistance = previousDistance + distance;
        const fullPath = previousNodes.push(destination);

        if (!shortestPaths[destination] || shortestPaths[destination].distance > totalDistance) {
            shortestPaths[destination] = { distance: totalDistance, path: fullPath };
        }

        if (visitedNodes.indexOf(destination) !== -1) {
            priorityQueue.push({ name: destination, distance });
        }
    }

    visitedNodes.push(source);

    let nextNode = priorityQueue.pop();

    while (nextNode) {
        const totalDistance = previousDistance + nextNode.distance;
        const fullPath = previousNodes.push(nextNode.name);
        traverse(nextNode.name, totalDistance, fullPath);

        nextNode = priorityQueue.pop();
    }
};

const createGraph = (routes) => {
    _.forEach(routes, (route) => {
        const source = route.sourceAirport;
        const destination = route.destinationAirport;

        if (!GRAPH[source]) GRAPH[source] = {};
        if (GRAPH[source][destination]) return;

        GRAPH[source][destination] = route.distance;
    });
};

const runCalculation = async() => {
    console.log(`Calculating shortest path from ${SOURCE_AIRPORT}...`);

    const routes = await getRoutes();
    createGraph(routes);
    shortestPaths[SOURCE_AIRPORT] = 0;
    traverse(SOURCE_AIRPORT, 0, [SOURCE_AIRPORT]);

    console.log(shortestPaths);

    process.exit(); // eslint-disable-line
};

runCalculation();
