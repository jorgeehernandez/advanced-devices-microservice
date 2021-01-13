const processFilters = require('../processFilters')
const http = require('../utils/http')

// NOTE: All tests were did at demotracking.bismark-iot.com
// NOTE: All the tests's results depends on actual devices state

const credentials = "Basic YWxlamFuZHJhckBiaXNtYXJrLm5ldC5jbzoxMjM0NTY3ODk==";
const httpInstance = http(credentials);

describe("Shoudld has c8y_Position and c8y_IsDevice every device", () => {
    const testCase = {
        fragmentType: 'c8y_Position'
    };

    let devices

    beforeAll(async () => {
        devices = await processFilters({
            httpInstance,
            query: testCase
        })
    })

    test('should return at least one device', () => {
        console.log(devices.length)
        expect(devices.length).toBeGreaterThan(0)
    })

    test('check alll devices has the c8y_IsDevice and c8y_Position properties', () => {
        devices.forEach((device, index) => {
            expect(device.c8y_Position && device.c8y_IsDevice).toBeTruthy();
        })
    })
})
describe("Retrun devices devices by availavility statys and with c8y_Position and c8y_IsDevice", () => {
    const status = 'UNAVAILABLE'
    const devicesToMatch = 6
    const filters = [{
        properties: [{
            key: 'c8y_Availability.status',
            comparison: '==',
            value: status
        }]
    }]

    const testCase = {
        filters: JSON.stringify(filters),
        fragmentType: 'c8y_Position'
    };

    let devices

    beforeAll(async () => {
        devices = await processFilters({
            httpInstance,
            query: testCase
        })
    })

    test(`should return ${devicesToMatch} device`, () => {
        expect(devices.length).toBe(devicesToMatch)
    })

    test(`check alll devices to be ${status})`, () => {
        devices.forEach((device, index) => {
            expect(device.c8y_Position && device.c8y_IsDevice && device.c8y_Availability.status === status).toBeTruthy();
        })
    })
})

describe("test with more than one porperty filter", () => {
    const status = 'UNAVAILABLE'
    const name = 'Tatiana_Santos'
    const devicesToMatch = 1
    const filters = [{
        properties: [
            {
                key: 'c8y_Availability.status',
                comparison: '==',
                value: status
            },
            {
                key:'name',
                comparison: '==',
                value: name
            }
        ]
    }]

    const testCase = {
        filters: JSON.stringify(filters),
        fragmentType: 'c8y_Position'
    };

    let devices

    beforeAll(async () => {
        devices = await processFilters({
            httpInstance,
            query: testCase
        })
    })

    test(`should return ${devicesToMatch} device`, () => {
        expect(devices.length).toBe(devicesToMatch)
    })

    test(`check alll devices to be ${status})`, () => {
        devices.forEach((device, index) => {
            expect(device.c8y_Position && device.c8y_IsDevice && device.c8y_Availability.status === status).toBeTruthy();
        })
    })

    test(`check alll devices to have contain ${name} in their names)`, () => {
        devices.forEach((device, index) => {
            expect(device.name.search(name) > -1).toBeTruthy();
        })
    })
})

describe("Should retrieve just devices from required group", () => {
    const groupId = '137'
    const devicesToMatch = 3
    const devicesIds = ['136726', '102586', '36704']
    const filters = [{
        group: groupId,
        properties: [
            {
                key: 'name',
                comparison: '*',
                value: 'Suntech'
            }
        ]
    }]

    const testCase = {
        filters: JSON.stringify(filters),
        fragmentType: 'c8y_Position'
    };

    let devices

    beforeAll(async () => {
        devices = await processFilters({
            httpInstance,
            query: testCase
        })
    })

    test(`should return ${devicesToMatch} device`, () => {
        expect(devices.length).toBe(devicesToMatch)
    })

    test(`check alll devices to have shoud have one of those ids (${devicesIds.join(',')}))`, () => {
        devices.forEach((device, index) => {
            expect(devicesIds.findIndex(id => device.id === id) > -1).toBeTruthy();
        })
    })
})

describe("Should retrieve just devices with critical active alarms from required group", () => {
    const groupId = '137'
    const devicesToMatch = 2
    const devicesIds = ['136726', '36704']
    const filters = [{
        group: groupId,
        alarms: [{
            severity: 'CRITICAL',
            status: 'ACTIVE'
        }]
    }]

    const testCase = {
        filters: JSON.stringify(filters),
        fragmentType: 'c8y_Position'
    };

    let devices

    beforeAll(async () => {
        devices = await processFilters({
            httpInstance,
            query: testCase
        })
    })

    test(`should return ${devicesToMatch} device`, () => {
        expect(devices.length).toBe(devicesToMatch)
    })

    test(`check alll devices to have shoud have one of those ids (${devicesIds.join(',')}))`, () => {
        devices.forEach((device, index) => {
            expect(devicesIds.findIndex(id => device.id === id) > -1).toBeTruthy();
        })
    })
})
