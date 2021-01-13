const getAll = require('./utils/getAll')
const _ = require('lodash')

async function processParams({ query, httpInstance }) {
    try {
        let { filters, ...generalParams } = query
        filters = filters ? JSON.parse(filters) : [{}]
        let results = filters.map(filter => processOneFilter(filter, httpInstance, generalParams))

        results = (await Promise.all(results)).flat()

        results = _.uniqBy(results, 'id').map(mapDeviceGroup)

        return results
    } catch (error) {
        throw new Error(error)
    }
}

function mapDeviceGroup(device) {
    if (device.assetParents)
        device.assetParents = device.assetParents.references.map(({ managedObject }) => {
            const { name, id } = managedObject
            return {
                name,
                id
            }
        })
    delete device.additionParents
    delete device.childAdditions
    delete device.childAssets
    // delete device.childDevices
    delete device.additionParents
    return device
}

async function processOneFilter({ group, alarms, properties }, instance, { type, fragmentType }) {
    let query = ''

    if (typeof fragmentType === 'string')
        query += `has(${fragmentType}) and `

    if (type)
        query += `type eq '${type}' and `


    if (group || properties)
        query += `has(c8y_IsDevice) and (${queryBuilder({ group, properties })})`

    query = query.replace(/ and $/g, '')
    
    const config = {
        params: {
            query,
            pageSize: 2000,
            withTotalPages: true,
            withGroups: true
        }
    }

    console.log(config)

    let devices = await getAll({
        promise: instance.get('inventory/managedObjects', config),
        instance,
        key: 'managedObjects'
    })

    devices = devices.filter(device => device.c8y_IsDevice)

    if (alarms) {
        alarms = alarms.map(alarm => {
            let params = {
                ...alarm,
                pageSize: 2000,
                withTotalPages: true
            }
            return getAll({
                promise: instance.get('alarm/alarms', { params }),
                instance,
                key: 'alarms'
            })
        })

        alarms = (await Promise.all(alarms)).flat()

        alarms = _.uniqBy(alarms, 'source.id').map(alarm => ({ id: alarm.source.id }))

        devices = _.intersectionBy(devices, alarms, 'id')
    }

    return devices
}

/**
 * build the request query
 * @param {object} filter 
 */
function queryBuilder({ group, properties }) {
    if (properties)
        properties = properties.map(propertiesBuilder)

    if (group)
        group = `bygroupid(${group})`

    if (group && properties)
        return `${group} and (${properties.join('')})`
    else
        return group ? group : properties.join('')
}

/**
 * becomes an properties object in a cumulocity query string
 * @param {object} propObject 
 */
function propertiesBuilder({ key, comparison, value }, index, { length }) {
    if (key !== undefined && comparison !== undefined && value !== undefined) {
        let query = ''
        comparison = transformComparison(comparison)

        if (comparison != '*') {

            if (isNaN(Number(value))) {
                if (comparison == 'eq') {
                    query = `${key} ${comparison} '${value}'`
                }
                else {
                    throw new Error(`La comparación ${reverseTransform(comparison)} solo funciona con datos numéricos`)
                }
            }
            else {
                query = `${key} ${comparison} ${value}`
            }

        }

        else {
            query = `${key} eq '*${value}*'`
        }

        if (index < length - 1) {
            query += ' and '
        }

        return query
    } else {
        throw new Error("properties filter malformed")
    }
}

function reverseTransform(comparison) {
    if (comparison === 'gt') return '>'
    if (comparison === 'ge') return '>='
    if (comparison === 'lt') return '<'
    if (comparison === 'le') return '<='
    return comparison
}

function transformComparison(comparison) {
    if (comparison === '==') return 'eq'
    if (comparison === '>') return 'gt'
    if (comparison === '>=') return 'ge'
    if (comparison === '<') return 'lt'
    if (comparison === '<=') return 'le'
    if (comparison === '*') return '*'

    throw new Error('Unexpected comparison symbol ' + comparison)
}

module.exports = processParams
