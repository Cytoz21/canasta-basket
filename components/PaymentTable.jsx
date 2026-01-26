'use client'

import { useState } from 'react'
import { Edit2, Trash2, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function PaymentTable({ payments, onEdit, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterEstado, setFilterEstado] = useState('Todos')

    const getStatusBadge = (estado) => {
        const badges = {
            'Pagado': 'badge-success',
            'Pendiente': 'badge-danger',
            'Semi-pagado': 'badge-warning'
        }
        return badges[estado] || 'badge-info'
    }

    const filteredPayments = payments.filter(pago => {
        const matchesSearch =
            pago.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.persona.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.mes.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterEstado === 'Todos' || pago.estado === filterEstado

        return matchesSearch && matchesFilter
    })

    const formatCurrency = (amount) => {
        return `S/. ${parseFloat(amount).toFixed(2)}`
    }

    const getDeuda = (pago) => {
        return pago.monto - pago.monto_pagado
    }

    return (
        <div className="fade-in">
            {/* Filters */}
            <div className="card mb-lg">
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Buscar por servicio, persona o mes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        <div style={{ position: 'relative' }}>
                            <Filter
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="form-select"
                                style={{ paddingLeft: '2.5rem' }}
                            >
                                <option value="Todos">Todos los estados</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Semi-pagado">Semi-pagado</option>
                                <option value="Pagado">Pagado</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Servicio</th>
                            <th>Mes/Año</th>
                            <th>Persona</th>
                            <th>Monto</th>
                            <th>Pagado</th>
                            <th>Deuda</th>
                            <th>Estado</th>
                            <th>Cuenta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No se encontraron pagos</p>
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((pago) => (
                                <tr key={pago.id}>
                                    <td>{pago.fecha ? format(new Date(pago.fecha), 'dd/MM/yyyy') : '-'}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {pago.servicio}
                                    </td>
                                    <td>{pago.mes} {pago.año}</td>
                                    <td>{pago.persona}</td>
                                    <td style={{ fontWeight: '600' }}>{formatCurrency(pago.monto)}</td>
                                    <td style={{ color: 'var(--success)' }}>{formatCurrency(pago.monto_pagado)}</td>
                                    <td style={{
                                        fontWeight: '600',
                                        color: getDeuda(pago) > 0 ? 'var(--danger)' : 'var(--success)'
                                    }}>
                                        {formatCurrency(getDeuda(pago))}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(pago.estado)}`}>
                                            {pago.estado}
                                        </span>
                                    </td>
                                    <td>{pago.cuenta_origen || '-'}</td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button
                                                onClick={() => onEdit(pago)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem' }}
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Estás seguro de eliminar este pago?')) {
                                                        onDelete(pago.id)
                                                    }
                                                }}
                                                className="btn btn-danger"
                                                style={{ padding: '0.5rem' }}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="card mt-lg">
                <div className="grid grid-3">
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)' }}>
                            Total de Pagos
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {filteredPayments.length}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)' }}>
                            Monto Total
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.monto, 0))}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)' }}>
                            Deuda Total
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                            {formatCurrency(filteredPayments.reduce((sum, p) => sum + getDeuda(p), 0))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
