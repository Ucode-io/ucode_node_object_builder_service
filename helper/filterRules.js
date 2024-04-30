const QUERY_KEYS_MAP = {
    '_in': '$in',
    '_eq': '$eq',
    '_ne': '$ne',
    '_nin': '$nin',
    '_lt': '$lt',
    '_lte': '$lte',
    '_gt': '$gt',
    '_gte': '$gte',
    '_null': 'null',
    '_nnull': { $ne: null },
    '_contains': '$regex',                                                                  //Contains the substring
    '_icontains': "icontains",                                                              //Contains the case-insensitive substring
    '_ncontains': "ncontains",                                                              //Doesn't contain the substring
    '_starts_with': 'starts_with',                                                          //Starts with
    '_istarts_with': 'istarts_with',                                                        //Starts with, case-insensitive
    '_nstarts_with': 'nstarts_with',                                                        //Doesn't start with
    '_nistarts_with': 'nistarts_with',	                                                    //Doesn't start with, case-insensitive
    '_ends_with': 'ends_with',                                                              //Ends with
    '_iends_with': 'iends_with',                                                            //Ends with, case-insensitive
    '_nends_with': 'nends_with',	                                                        //Doesn't end with
    '_niends_with': 'niends_with',	                                                        //Doesn't end with, case-insensitive
    '_between': { '$gte': 'first_value_of_array', '$lte': 'second_value_of_array' },	    //Is between two values (inclusive)
    '_nbetween': { '$lte': 'first_value_of_array', '$gte': 'second_value_of_array' },       //Is not between two values (inclusive)
    '_empty': 'null',                                                                       //Is empty (null or falsy)
    '_nempty': { $ne: null }, 	                                                            //Is not empty (null or falsy)
    '_intersects': 'intersects',                                                            //Value intersects a given point
    '_nintersects': 'nintersects',                                                          //Value does not intersect a given point
    '_intersects_bbox': 'intersects_bbox',                                                  //Value is in a bounding box
    '_nintersects_bbox': 'nintersects_bbox',                                                //Value is not in a bounding box
}





module.exports = (key, value) => {
    let query = ""
    if (QUERY_KEYS_MAP[key]) {
        switch (key) {
            case '_null':
            case '_empty':
                query = null
                break;
            case '_nnull':
            case '_nempty':
                query = { $ne: null }
                break;
            case '_in':
            case '_nin':
                if (!Array.isArray(value)) throw new TypeError('expected array, got ' + value)
                query = { [QUERY_KEYS_MAP[key]]: value }
                break;
            case '_icontains':
                query = { $regex: value, $options: 'i' }
                break;
            case '_ncontains':
                query = { $not: { $regex: value } }
                break;
            case '_starts_with':
                query = { $regex: `^${value}` }
                break;
            case '_istarts_with':
                query = { $regex: `^${value}`, $options: 'i' }
                break;
            case '_nstarts_with':
                query = { $not: { $regex: `^${value}` } }
                break;
            case '_nistarts_with':
                query = { $not: { $regex: `^${value}`, $options: 'i' } }
                break;
            case '_ends_with':
                query = { $regex: `${value}$` }
                break;
            case '_iends_with':
                query = { $regex: `${value}$`, $options: 'i' }
                break;
            case '_nends_with':
                query = { $not: { $regex: `${value}$` } }
                break;
            case '_niends_with':
                query = { $not: { $regex: `${value}$`, $options: 'i' } }
                break;
            case '_between':
                if (!Array.isArray(value)) throw new TypeError('expected array, got ' + value)
                query = {
                    $gte: value[0],
                    $lte: value[1]
                }
                break;
            case '_nbetween':
                if (!Array.isArray(value)) throw new TypeError('expected array, got ' + value)
                query = {
                    $gte: value[1],
                    $lte: value[0]
                }
                break;
            case '_intersects':
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
            case '_nintersects':
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
            case '_intersects_bbox':
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
            case '_nintersects_bbox':
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