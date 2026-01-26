'use client'

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

export default function PaymentForm({ payment, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        fecha: '',
        servicio: '',
        monto: '',
        monto_pagado: '0',
        estado: 'Pendiente',
        cuenta_origen: '',
        persona: '',
        mes: '',
        año: new Date().getFullYear()
    })

    useEffect(() => {
        if (payment) {
            setFormData({
                ...payment,
                fecha: payment.fecha ? payment.fecha.split('T')[0] : '',
                monto: payment.monto?.toString() || '',
                monto_pagado: payment.monto_pagado?.toString() || '0'
            })
        }
    }, [payment])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const dataToSave = {
            ...formData,
            monto: parseFloat(formData.monto),
            monto_pagado: parseFloat(formData.monto_pagado),
            año: parseInt(formData.año)
        }

        onSave(dataToSave)
    }

    const servicios = ['HIDRANDINA', 'QUAVII', 'SEDALIB', 'LICUADORA', 'AGUA', 'LUZ', 'INTERNET', 'GAS']
    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
    const estados = ['Pendiente', 'Semi-pagado', 'Pagado']
    const cuentas = ['INTERBANK', 'BCP', 'BBVA', 'SCOTIABANK', 'EFECTIVO']

    const deudaRestante = formData.monto && formData.monto_pagado
        ? (parseFloat(formData.monto) - parseFloat(formData.monto_pagado)).toFixed(2)
        : '0.00'

    return (
        <div className="card fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header flex justify-between items-center">
                <h3 className="card-title">{payment ? 'Editar Pago' : 'Registrar Nuevo Pago'}</h3>
                {onCancel && (
                    <button onClick={onCancel} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                    <div className="form-group">
                        <label className="form-label">Fecha</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Servicio</label>
                        <select
                            name="servicio"
                            value={formData.servicio}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Seleccionar servicio</option>
                            {servicios.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mes</label>
                        <select
                            name="mes"
                            value={formData.mes}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Seleccionar mes</option>
                            {meses.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Año</label>
                        <input
                            type="number"
                            name="año"
                            value={formData.año}
                            onChange={handleChange}
                            className="form-input"
                            min="2020"
                            max="2030"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Monto Total (S/.)</label>
                        <input
                            type="number"
                            name="monto"
                            value={formData.monto}
                            onChange={handleChange}
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Monto Pagado (S/.)</label>
                        <input
                            type="number"
                            name="monto_pagado"
                            value={formData.monto_pagado}
                            onChange={handleChange}
                            className="form-input"
                            step="0.01"
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estado</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            {estados.map(e => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Persona Responsable</label>
                        <input
                            type="text"
                            name="persona"
                            value={formData.persona}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Nombre de la persona"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cuenta Origen</label>
                        <select
                            name="cuenta_origen"
                            value={formData.cuenta_origen}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="">Seleccionar cuenta</option>
                            {cuentas.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ color: 'var(--warning)' }}>
                            Deuda Restante: S/. {deudaRestante}
                        </label>
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--warning)'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {parseFloat(deudaRestante) > 0
                                    ? `Falta pagar: S/. ${deudaRestante}`
                                    : 'Pago completado'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-md mt-lg">
                    <button type="submit" className="btn btn-primary">
                        <Save size={18} />
                        {payment ? 'Actualizar Pago' : 'Guardar Pago'}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="btn btn-outline">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
