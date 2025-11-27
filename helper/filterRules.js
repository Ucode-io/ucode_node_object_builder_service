const QUERY_KEYS_MAP = {
    '$in': '$in',
    '$eq': '$eq',
    '$ne': '$ne',
    '$nin': '$nin',
    '$lt': '$lt',
    '$lte': '$lte',
    '$gt': '$gt',
    '$gte': '$gte',
    '$null': 'null',
    '$nnull': { $ne: null },
    '$contains': '$regex',                                                                  //Contains the substring
    '$icontains': "icontains",                                                              //Contains the case-insensitive substring
    '$ncontains': "ncontains",                                                              //Doesn't contain the substring
    '$starts_with': 'starts_with',                                                          //Starts with
    '$istarts_with': 'istarts_with',                                                        //Starts with, case-insensitive
    '$nstarts_with': 'nstarts_with',                                                        //Doesn't start with
    '$nistarts_with': 'nistarts_with',	                                                    //Doesn't start with, case-insensitive
    '$ends_with': 'ends_with',                                                              //Ends with
    '$iends_with': 'iends_with',                                                            //Ends with, case-insensitive
    '$nends_with': 'nends_with',	                                                        //Doesn't end with
    '$niends_with': 'niends_with',	                                                        //Doesn't end with, case-insensitive
    '$between': { '$gte': 'first_value_of_array', '$lte': 'second_value_of_array' },	    //Is between two values (inclusive)
    '$nbetween': { '$lte': 'first_value_of_array', '$gte': 'second_value_of_array' },       //Is not between two values (inclusive)
    '$empty': 'null',                                                                       //Is empty (null or falsy)
    '$nempty': { $ne: null }, 	                                                            //Is not empty (null or falsy)
    '$intersects': 'intersects',                                                            //Value intersects a given point
    '$nintersects': 'nintersects',                                                          //Value does not intersect a given point
    '$intersects_bbox': 'intersects_bbox',                                                  //Value is in a bounding box
    '$nintersects_bbox': 'nintersects_bbox',                                                //Value is not in a bounding box
}





module.exports = (key, value) => {
    let query = ""
    if (QUERY_KEYS_MAP[key]) {
        switch (key) {
            case '$null':
            case '$empty':
                query = null
                break;
            case '$nnull':
            case '$nempty':
                query = { $ne: null }
                break;
            case '$in':
            case '$nin':
                if (!Array.isArray(value)) throw new TypeError('expected array, got ' + value)
                query = { [QUERY_KEYS_MAP[key]]: value }
                break;
            case '$icontains':
                query = { $regex: value, $options: 'i' }
                break;
            case '$ncontains':
                query = { $not: { $regex: value } }
                break;
            case '$starts_with':
                query = { $regex: `^${value}` }
                break;
            case '$istarts_with':
                query = { $regex: `^${value}`, $options: 'i' }
                break;
            case '$nstarts_with':
                query = { $not: { $regex: `^${value}` } }
                break;
            case '$nistarts_with':
                query = { $not: { $regex: `^${value}`, $options: 'i' } }
                break;
            case '$ends_with':
                query = { $regex: `${value}$` }
                break;
            case '$iends_with':
                query = { $regex: `${value}$`, $options: 'i' }
                break;
            case '$nends_with':
                query = { $not: { $regex: `${value}$` } }
                break;
            case '$niends_with':
                query = { $not: { $regex: `${value}$`, $options: 'i' } }
                break;
            case '$between':
                if (!Array.isArray(value)) throw new TypeError('expected array, got ' + value)
                query = {
                    $gte: value[0],
                    $lte: value[1]
                }
                break;
            case '$nbetween':
                if (!Array.isArray(value)) throw new TypeError('expected array, got ' + value)
                query = {
                    $gte: value[1],
                    $lte: value[0]
                }
                break;
            case '$intersects':
                let geoIntersect = {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [value.min_longitude, value.min_latitude], // Lower-left corner
                            [value.max_longitude, value.min_latitude], // Lower-right corner
                            [value.max_longitude, value.max_latitude], // Upper-right corner
                            [value.min_longitude, value.max_latitude], // Upper-left corner
                            [value.min_longitude, value.min_latitude]  // Close the polygon
                        ]
                    ]
                };
                query = { $geoIntersects: { $geometry: geoIntersect } }
                break;
            case '$nintersects':
                let notGeoIntersect = {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [value.min_longitude, value.min_latitude], // Lower-left corner
                            [value.max_longitude, value.min_latitude], // Lower-right corner
                            [value.max_longitude, value.max_latitude], // Upper-right corner
                            [value.min_longitude, value.max_latitude], // Upper-left corner
                            [value.min_longitude, value.min_latitude]  // Close the polygon
                        ]
                    ]
                };
                query = { $not: { $geoIntersects: { $geometry: notGeoIntersect } } }
                break;
            case '$intersects_bbox':
                let bbox = {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [value.min_longitude, value.min_latitude], // Lower-left corner
                            [value.max_longitude, value.min_latitude], // Lower-right corner
                            [value.max_longitude, value.max_latitude], // Upper-right corner
                            [value.min_longitude, value.max_latitude], // Upper-left corner
                            [value.min_longitude, value.min_latitude]  // Close the polygon
                        ]
                    ]
                };
                query = { $geoWithin: { $geometry: bbox } }
                break;
            case '$nintersects_bbox':
                let notBbox = {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [value.min_longitude, value.min_latitude], // Lower-left corner
                            [value.max_longitude, value.min_latitude], // Lower-right corner
                            [value.max_longitude, value.max_latitude], // Upper-right corner
                            [value.min_longitude, value.max_latitude], // Upper-left corner
                            [value.min_longitude, value.min_latitude]  // Close the polygon
                        ]
                    ]
                };
                query = { $not: { $geoWithin: { $geometry: notBbox } } }
                break;
                break;
            default:
                query = { [QUERY_KEYS_MAP[key]]: value }
                break;
        }
    } else {
        throw new Error("unsupported query key : " + key)
    }
    return query
}