'use strict';

const geolib = require('geolib');

const { flightsDb } = require('../connection');

const getRoutes = () => {
    return flightsDb
        .select(
            'r.id',
            { 'sourceLat': 'a1.latitude' },
            { 'sourceLong': 'a1.longitude' },
            { 'destinationLat': 'a2.latitude' },
            { 'destinationLong': 'a2.longitude' }
        )
        .from({ r: 'routes' })
        .join({ a1: 'airports' }, 'a1.id', '=', 'r.source_airport_id')
        .join({ a2: 'airports' }, 'a2.id', '=', 'r.destination_airport_id')
        .where('r.distance', null);
};

const updateRouteDistance = (route, distance) => {
    return flightsDb('routes')
        .where({ id: route.id })
        .update({ distance: distance });
};

const calculateRouteDistance = (route) => {
    const { sourceLat, sourceLong, destinationLat, destinationLong } = route;
    const source = { latitude: sourceLat, longitude: sourceLong };
    const destination = { latitude: destinationLat, longitude: destinationLong };

    return geolib.getDistance(source, destination);
};

const runCalculation = async() => {
    console.log('Calculating missing distances in the routes table...');

    const routes = await getRoutes();

    for (const route of routes) {
        await updateRouteDistance(route, calculateRouteDistance(route));
    }

    console.log(`${routes.length} routes calculated!`);

    process.exit(); // eslint-disable-line
};

runCalculation();
