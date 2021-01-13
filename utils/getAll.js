const _ = require('lodash')
/**
 * Get all the pages of a certain object
 * @param {object} param 
 * @param {Promise} param.promise the initial request
 * @param {Function} param.instance the http request instance
 * @param {string} param.key the key where the data you are searching is
 */
function getAll({ promise, instance, key }) {
    let things = []
    return new Promise(async (resolve, rejection) => {

        const getNext = async request => {
            try {
                const { data } = await request
                const { statistics, next } = data
    
                const thing = _.get(data, key)
                things = [...things, ...thing]
    
                const { currentPage, totalPages } = statistics
    
                if (currentPage < totalPages)
                    getNext(instance.get(next))
                else {
                    resolve(things)
                }
            } catch (error) {
                rejection(error.message)
            }
        }

        getNext(promise)
    })
}

module.exports = getAll
