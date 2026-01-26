'use client'

import PaymentCharts from './PaymentCharts'
import { AlertCircle, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function Dashboard({ payments, stats }) {
    const formatCurrency = (value) => `S/. ${value.toFixed(2)}`

    const pendingPayments = payments.filter(p => p.estado === 'Pendiente')
    const semiPaidPayments = payments.filter(p => p.estado === 'Semi-pagado')

    return (
        <div className="fade-in">
            {/* Alert for Pending Payments */}
            {pendingPayments.length > 0 && (
                <div className="card mb-lg" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.05))',
                    border: '2px solid var(--danger)'
                }}>
                    <div className="flex gap-md items-center">
                        <AlertCircle size={32} color="var(--danger)" />
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--danger)' }}>
                                {pendingPayments.length} Pago{pendingPayments.length !== 1 ? 's' : ''} Pendiente{pendingPayments.length !== 1 ? 's' : ''}
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                Total: {formatCurrency(stats.totalPendiente || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Semi-Paid Alert */}
            {semiPaidPayments.length > 0 && (
                <div className="card mb-lg" style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))',
                    border: '2px solid var(--warning)'
                }}>
                    <div className="flex gap-md items-center">
                        <TrendingUp size={32} color="var(--warning)" />
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--warning)' }}>
                                {semiPaidPayments.length} Pago{semiPaidPayments.length !== 1 ? 's' : ''} Semi-Pagado{semiPaidPayments.length !== 1 ? 's' : ''}
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                Deuda restante: {formatCurrency(stats.totalSemiPagado || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-4 mb-xl">
                <div className="card">
                    <div className="flex gap-md items-center">
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(99, 102, 241, 0.2)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <DollarSign size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Total Pagos
                            </p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {payments.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex gap-md items-center">
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(16, 185, 129, 0.2)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <TrendingUp size={24} color="var(--success)" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Completados
                            </p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                                {payments.filter(p => p.estado === 'Pagado').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex gap-md items-center">
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <AlertCircle size={24} color="var(--danger)" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Pendientes
                            </p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                                {pendingPayments.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex gap-md items-center">
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(236, 72, 153, 0.2)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <Users size={24} color="var(--secondary)" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Personas
                            </p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary)' }}>
                                {Object.keys(stats.deudaPorPersona || {}).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <PaymentCharts stats={stats} />

            {/* Debt Summary by Person */}
            <div className="card mt-xl">
                <h3 className="card-title">Resumen de Deudas por Persona</h3>
                <div className="grid grid-2">
                    {Object.entries(stats.deudaPorPersona || {}).map(([persona, deuda]) => (
                        <div
                            key={persona}
                            style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {persona}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Deuda total
                                    </p>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: deuda > 0 ? 'var(--danger)' : 'var(--success)'
                                }}>
                                    {formatCurrency(deuda)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
