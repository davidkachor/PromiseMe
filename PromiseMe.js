class PromiseMe{
    constructor(callback) {
        this.state = 'pending'
        this.value = null
        this.fulfillCallbacks = []
        this.rejectCallbacks = []

        const resolve = value => {
            if (this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
                this.fulfillCallbacks.forEach(fn => fn(value))
            }
        }
        const reject = value => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.value = value
                this.rejectCallbacks.forEach(fn => fn(value))
            }
        }

        try {
            callback(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }

    then (onFulfill, onReject) {
        return new PromiseMe((resolve, reject) => {
            if (this.state === 'pending') {
                this.fulfillCallbacks.push(data => {
                    try {
                        const fulfilledPromise = onFulfill(data)
                        if (fulfilledPromise instanceof PromiseMe) {
                            fulfilledPromise.then(resolve, reject)
                        } else resolve(fulfilledPromise)
                    } catch (err) {
                        reject(err)
                    }
                })
                this.rejectCallbacks.push(data => {
                    try {
                        const rejectedPromise = onReject(data)
                        if (rejectedPromise instanceof PromiseMe) {
                            rejectedPromise.then(resolve, reject)
                        } else reject(rejectedPromise)
                    } catch (err) {
                        reject(err)
                    }
                })
            }

            if (this.state === 'fulfilled') {
                try {
                    const fulfilledPromise = onFulfill(this.value)
                    if (fulfilledPromise instanceof PromiseMe) {
                        fulfilledPromise.then(resolve, reject)
                    } else resolve(fulfilledPromise)
                } catch (err) {
                    reject(err)
                }
            }
            if (this.state === 'rejected') {
                try {
                    const rejectedPromise = onReject(this.value)
                    if (rejectedPromise instanceof PromiseMe) {
                        rejectedPromise.then(resolve, reject)
                    } else resolve(rejectedPromise)
                } catch (err) {
                    reject(err)
                }
            }
        })
    }

    catch (onReject) {
        return this.then(null, onReject)
    }

    static resolve(value) {
        return new PromiseMe(resolve => resolve(value))
    }
    static reject (value) {
        return new PromiseMe((resolve, reject) => reject(value))
    }
}

module.exports = PromiseMe;
