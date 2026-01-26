import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'payments.json')

// Leer datos del archivo JSON
function readData() {
    try {
        const fileContents = fs.readFileSync(dataFilePath, 'utf8')
        return JSON.parse(fileContents)
    } catch (error) {
        console.error('Error reading data:', error)
        return []
    }
}

// Escribir datos al archivo JSON
function writeData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
    } catch (error) {
        console.error('Error writing data:', error)
        throw error
    }
}

// Obtener todos los pagos
export async function getAllPayments() {
    const data = readData()
    return data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

// Crear un nuevo pago
export async function createPayment(payment) {
    const data = readData()
    const newId = data.length > 0 ? Math.max(...data.map(p => p.id)) + 1 : 1
    const newPayment = { ...payment, id: newId }
    data.push(newPayment)
    writeData(data)
    return newPayment
}

// Actualizar un pago existente
export async function updatePayment(id, updates) {
    const data = readData()
    const index = data.findIndex(p => p.id === parseInt(id))
    if (index === -1) {
        throw new Error('Payment not found')
    }
    data[index] = { ...data[index], ...updates }
    writeData(data)
    return data[index]
}

// Eliminar un pago
export async function deletePayment(id) {
    const data = readData()
    const filteredData = data.filter(p => p.id !== parseInt(id))
    writeData(filteredData)
}

// Obtener estadísticas para gráficos
export async function getPaymentStats() {
    const data = readData()

    // Calcular estadísticas
    const stats = {
        totalPendiente: 0,
        totalPagado: 0,
        totalSemiPagado: 0,
        deudaPorPersona: {},
        pagosPorServicio: {},
        pagosPorMes: {}
    }

    data.forEach(pago => {
        const deuda = pago.monto - pago.monto_pagado

        // Total por estado
        if (pago.estado === 'Pendiente') {
            stats.totalPendiente += deuda
        } else if (pago.estado === 'Pagado') {
            stats.totalPagado += pago.monto
        } else if (pago.estado === 'Semi-pagado') {
            stats.totalSemiPagado += deuda
        }

        // Deuda por persona
        if (!stats.deudaPorPersona[pago.persona]) {
            stats.deudaPorPersona[pago.persona] = 0
        }
        if (pago.estado !== 'Pagado') {
            stats.deudaPorPersona[pago.persona] += deuda
        }

        // Pagos por servicio
        if (!stats.pagosPorServicio[pago.servicio]) {
            stats.pagosPorServicio[pago.servicio] = 0
        }
        stats.pagosPorServicio[pago.servicio] += pago.monto

        // Pagos por mes
        const mesKey = `${pago.mes} ${pago.año}`
        if (!stats.pagosPorMes[mesKey]) {
            stats.pagosPorMes[mesKey] = { pendiente: 0, pagado: 0 }
        }
        if (pago.estado === 'Pagado') {
            stats.pagosPorMes[mesKey].pagado += pago.monto
        } else {
            stats.pagosPorMes[mesKey].pendiente += deuda
        }
    })

    return stats
}
