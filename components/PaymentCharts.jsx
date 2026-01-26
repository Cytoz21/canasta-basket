'use client'

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PaymentCharts({ stats }) {
    const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6']

    // Datos para gráfico de pagos por mes
    const monthlyData = Object.entries(stats.pagosPorMes || {}).map(([mes, data]) => ({
        mes,
        Pendiente: data.pendiente,
        Pagado: data.pagado
    }))

    // Datos para gráfico de servicios
    const serviceData = Object.entries(stats.pagosPorServicio || {}).map(([servicio, monto]) => ({
        name: servicio,
        value: monto
    }))

    // Datos para deuda por persona
    const personData = Object.entries(stats.deudaPorPersona || {}).map(([persona, deuda]) => ({
        persona,
        deuda
    }))

    const formatCurrency = (value) => `S/. ${value.toFixed(2)}`

    return (
        <div className="fade-in">
            {/* Stats Cards */}
            <div className="grid grid-3 mb-xl">
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Total Pendiente
                    </h4>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger)', margin: 0 }}>
                        {formatCurrency(stats.totalPendiente || 0)}
                    </p>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Semi-Pagado
                    </h4>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)', margin: 0 }}>
                        {formatCurrency(stats.totalSemiPagado || 0)}
                    </p>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Total Pagado
                    </h4>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', margin: 0 }}>
                        {formatCurrency(stats.totalPagado || 0)}
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-2">
                {/* Monthly Payments Chart */}
                <div className="card">
                    <h3 className="card-title">Pagos por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis
                                dataKey="mes"
                                stroke="var(--text-secondary)"
                                style={{ fontSize: '0.85rem' }}
                            />
                            <YAxis
                                stroke="var(--text-secondary)"
                                style={{ fontSize: '0.85rem' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)'
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                            <Bar dataKey="Pagado" fill="#10b981" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Pendiente" fill="#ef4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Service Distribution Chart */}
                <div className="card">
                    <h3 className="card-title">Distribución por Servicio</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)'
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Debt by Person Chart */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="card-title">Deuda por Persona</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={personData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis
                                dataKey="persona"
                                stroke="var(--text-secondary)"
                                style={{ fontSize: '0.85rem' }}
                            />
                            <YAxis
                                stroke="var(--text-secondary)"
                                style={{ fontSize: '0.85rem' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)'
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Bar dataKey="deuda" fill="#ec4899" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
