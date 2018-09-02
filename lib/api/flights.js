'use strict';

const _ = require('lodash');
const Graph = require('node-dijkstra');

const { flightsDb } = require('../db/connection');
const respond = require('./responses');

const findAirportByIata = (iata) => {
    return flightsDb
        .select()
        .from('airports')
        .where('iata', iata)
        .first();
};

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

const createGraph = (routes) => {
    const graph = {};

    _.forEach(routes, (route) => {
        const source = route.sourceAirport;
        const destination = route.destinationAirport;

        if (!graph[source]) graph[source] = {};
        if (graph[source][destination]) return;

        graph[source][destination] = route.distance;
    });

    return graph;
};


module.exports = async(context) => {
    const source = context.params.source;
    const destination = context.params.destination;

    if (!source || !destination) {
        return respond.badRequest(context, 'Missing source or destination airport code!');
    }

    const sourceAirport = await findAirportByIata(source);
    const destinationAirport = await findAirportByIata(destination);
    console.log(destinationAirport);

    if (!sourceAirport || !destinationAirport) {
        return respond.notFound(context);
    }

    const routes = await getRoutes();
    const routesGraph = new Graph(createGraph(routes));
    const shortestPath = routesGraph.path(source, destination, { cost: true });
    const distanceKm = Math.round(shortestPath.cost / 1000);

    respond.success(context, {
        route: shortestPath.path,
        distance: distanceKm,
        source: sourceAirport,
        destination: destinationAirport
    });
};
