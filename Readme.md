# Advanced filter devices microservice for Cumulocity IoT platform 

### Request structure  

https://{tenant}.{instance}.com/service/custom-device-filters?filters={filter}&{...normalCumulocityParams} 

### Normal cumulocity params e.g.  
```js
{
    fragmentType: "c8y_Position",
    dateFrom: "2019-07-05T15:45:32.286Z"
}
```

### Filter structure example
```js
[
    {
        group: 11111, // group id
        alarms: [{
            severity: 'CRITICAL',
            status: 'ACTIVE',
            type: 'Panic Button'
        },
        ...moreFilters],
        properties: [{
            key: 'Velocidad',
            comparison: '>=',
            value: '40'
        },
        ...moreFilters]
    }
]
```
