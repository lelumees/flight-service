'use strict';

const _ = require('lodash');

const { flightsDb } = require('../connection');
const SOURCE_AIRPORT = 'TLL';

const GRAPH = {};
const comparator = (a, b) => a.distance - b.distance;
const shortestPaths = [];
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

const updateShortestPath = (name, distance, path) => {
    const currentPath = _.find(shortestPaths, { name: name });

    if (currentPath.distance > distance) {
        const index = _.findIndex(shortestPaths, { name: name });
        shortestPaths.splice(index, 1, { name, distance, path });
    }

    shortestPaths.sort(comparator);
};

const traverse = (source) => {
    visitedNodes.push(source);

    const { name, distance, path } = source;
    const routes = GRAPH[name];

    const clonedPath = _.clone(path);
    clonedPath.push(name);

    for (const destination in routes) {
        if (_.find(visitedNodes, destination)) continue;

        const routeDistance = routes[destination];
        const totalDistance = routeDistance + distance;

        const current = _.find(shortestPaths, { name: destination });

        if (!current) continue;

        if (current.distance > totalDistance) {
            updateShortestPath(destination, totalDistance, clonedPath);
        }
    }

    const newNode = shortestPaths.shift();
    if (!newNode) return;

    traverse(newNode);
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

const populateQueue = () => {
    for (const node in GRAPH) {
        const distance = node === SOURCE_AIRPORT ? 0 : Infinity;
        shortestPaths.push({ name: node, distance: distance, path: [] });
    }
    shortestPaths.sort(comparator);
};

const runCalculation = async() => {
    console.log(`Calculating shortest path from ${SOURCE_AIRPORT}...`);

    const routes = await getRoutes();
    createGraph(routes);
    populateQueue();
    traverse(shortestPaths.shift());

    console.log(visitedNodes);
    process.exit(); // eslint-disable-line
};

runCalculation();
