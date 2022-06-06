module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validator
    const protheus = app.downstream.protheus

    const save = async (req, res) => {
        const rate = { ...req.body }
        if (req.params.id) rate.id = req.params.id

        rate.integrated = false

        try {
            if (rate.code) {
                existsOrError(rate.code, 'Entrada não informada')
            }
            existsOrError(rate.element, 'Material não informada')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (!rate.liquid || rate.liquid == 0) {
            rate.liquid = rate.weightin

        }

        if (rate.id) {
            app.db('rates')
                .update(rate)
                .where({ id: rate.id })
                .then(_ => {
                    let weighing = {
                        vehicle: rate.vehicle,
                        dateweight: new Date,
                        weightin: rate.weightin,
                        inout: 1
                    }
                    app.db('weighings')
                        .update(weighing)
                        .where({ vehicle: rate.vehicle })
                        .then(_ => console.log(_))
                        .catch(err => console.log(err))

                    res.status(204).send()
                })
                .catch(err => res.status(500).send(err))
        } else {

            app.db('rates')
                .insert(rate)
                .then(async _ => {
                    let weighing = {
                        vehicle: rate.vehicle,
                        dateweight: new Date,
                        weightin: rate.weightin,
                        inout: 1
                    }
                    app.db('weighings')
                        .insert(weighing)
                        .then(_ => console.log(_))
                        .catch(err => console.log(err))

                    let rateQty = await app.db('rates').count('*', { as: 'total' }).where({ vehicle: rate.vehicle }).first()

                    let vehicleDB = await app.db('vehicles').update({ qty: rateQty.total }).where({ id: rate.vehicle })

                    res.status(204).send()
                })
                .catch(err => res.status(500).send(err))
        }
    }

    const updateByCode = async (req, res) => {
        const rate = { ...req.body }

        app.db('rates')
            .update(rate)
            .where({ code: req.params.code })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const get = (req, res) => {
        app.db({ r: 'rates', v: 'vehicles', e: 'element' })
            .select('v.id')
            .then(rates => res.json(rates))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('rates')
            .select('*')
            .where({ id: req.params.id })
            .then(rates => res.json(rates))
            .catch(err => res.status(500).send(err))
    }
    const getByVehicle = (req, res) => {
        app.db({ r: 'rates' })
            .innerJoin('vehicles', 'r.vehicle', 'vehicles.id')
            .innerJoin('element', 'r.element', 'element.id')
            .innerJoin('prices as p', function () {
                this.on('p.supplier', '=', 'vehicles.supplier').andOn('p.element', '=', 'r.element').andOn('p.company', '=', 'vehicles.company')
            })
            .select('r.id as rateid', 'vehicles.id as id', 'element.id as element', 'element.fullname as ename', 'r.liquid', 'r.price as rprice', 'r.weightin as weightin', 'r.tare as tare', 'r.loss as loss', 'r.liquid as liquid', 'p.protheus as table', '*')
            .where({ vehicle: req.params.vehicle })
            .then(rates => res.json(rates))
            .catch(err => res.status(500).send(err))

    }
    const getByCode = (req, res) => {
        app.db({ r: 'rates' })
            .innerJoin('element', 'r.element', 'element.id')
            .innerJoin('vehicles', 'r.vehicle', 'vehicles.id')
            .innerJoin('suppliers', 'vehicles.supplier', 'suppliers.id')
            .select('vehicles.qty', 'r.code', 'vehicles.type', 'vehicles.company as company', 'r.id as rateid', 'vehicles.active', 'element.id as element', 'vehicles.id as vehicle', 'suppliers.id as supid', 'suppliers.registration', 'suppliers.fullname as sname', 'element.fullname as ename', 'r.liquid', 'r.price', 'r.weightin as weightin', 'r.tare as tare', 'r.loss as loss', 'r.liquid as liquid')
            .where({ code: req.params.code })
            .then(rates => res.json(rates))
            .catch(err => res.status(500).send(err))

    }
    const remove = async (req, res) => {
        try {
            const rateFromDB = await app.db({ r: 'rates' })
                .innerJoin('vehicles', 'r.vehicle', 'vehicles.id')
                .select('r.id as id', 'r.vehicle as vehicle', 'vehicles.company as company')
                .where('r.id', req.params.id)
                .first()

            if (rateFromDB) {
                app.db('rates')
                    .select('*')
                    .where({ id: req.params.id })
                    .del().then((el) => {
                        app.db('rates').count('*', { as: 'total' }).where({ vehicle: rateFromDB.vehicle }).first().then((value) => {
                            app.db('vehicles').update({ qty: parseInt(value.total) }).where({ id: rateFromDB.vehicle }).then((result) => {
                                protheus.sz2Exc(rateFromDB)
                            })
                        })
                        res.status(204).send()

                    })

            } else {
                existsOrError(rowsUpdated, 'Classificação não existe')

            }

        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    const getNextNumber = async (req, res) => {
        app.db({ r: 'numbers' })
            .select('code')
            .where('code', '!=', '')
            .orderByRaw('code::int desc')
            .first()
            .then(numbers => {
                numbers = numbers ? numbers : { code: '0' }
                numbers.code++
                app.db('numbers')
                    .insert(numbers)
                    .then(_ => console.log(_))
                    .catch(err => console.log(err))
                res.json(numbers ? numbers.code : '0')
            })
            .catch(err => console.log(err))

    }

    return {
        save,
        updateByCode,
        get,
        getById,
        getByVehicle,
        getByCode,
        remove,
        getNextNumber
    }
}