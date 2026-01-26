'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, Plus, List, RefreshCw } from 'lucide-react'
import PaymentForm from '@/components/PaymentForm'
import PaymentTable from '@/components/PaymentTable'
import Dashboard from '@/components/Dashboard'
import { getAllPayments, createPayment, updatePayment, deletePayment, getPaymentStats } from '@/lib/payments'

export default function Home() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [payments, setPayments] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [editingPayment, setEditingPayment] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadPayments()
    }, [])

    const loadPayments = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getAllPayments()
            setPayments(data)
            const statsData = await getPaymentStats()
            setStats(statsData)
        } catch (err) {
            console.error('Error loading payments:', err)
            setError('Error al cargar los pagos. Verifica tu conexión a Supabase.')
        } finally {
            setLoading(false)
        }
    }

    const handleSavePayment = async (paymentData) => {
        try {
            if (editingPayment) {
                await updatePayment(editingPayment.id, paymentData)
            } else {
                await createPayment(paymentData)
            }
            await loadPayments()
            setEditingPayment(null)
            setActiveTab('list')
        } catch (err) {
            console.error('Error saving payment:', err)
            alert('Error al guardar el pago')
        }
    }

    const handleDeletePayment = async (id) => {
        try {
            await deletePayment(id)
            await loadPayments()
        } catch (err) {
            console.error('Error deleting payment:', err)
            alert('Error al eliminar el pago')
        }
    }

    const handleEditPayment = (payment) => {
        setEditingPayment(payment)
        setActiveTab('form')
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'form', label: 'Registrar Pago', icon: Plus },
        { id: 'list', label: 'Lista de Pagos', icon: List },
    ]

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
            {/* Header */}
            <div className="text-center mb-xl fade-in">
                <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>
                    Sistema de Gestión de Pagos
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Pago de Servicios 1er Piso Razuri 2026
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="card mb-lg" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.05))',
                    border: '2px solid var(--danger)'
                }}>
                    <p style={{ margin: 0, color: 'var(--danger)', fontWeight: '600' }}>
                        {error}
                    </p>
                    <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Asegúrate de haber configurado las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.local
                    </p>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="card mb-lg fade-in">
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                    if (tab.id === 'form') {
                                        setEditingPayment(null)
                                    }
                                }}
                                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                                style={{ flex: '1', minWidth: '150px' }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        )
                    })}
                    <button
                        onClick={loadPayments}
                        className="btn btn-secondary"
                        disabled={loading}
                        title="Recargar datos"
                    >
                        <RefreshCw size={18} className={loading ? 'spinner' : ''} />
                        Recargar
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                        Cargando datos...
                    </p>
                </div>
            ) : (
                <>
                    {activeTab === 'dashboard' && (
                        <Dashboard payments={payments} stats={stats} />
                    )}

                    {activeTab === 'form' && (
                        <PaymentForm
                            payment={editingPayment}
                            onSave={handleSavePayment}
                            onCancel={() => {
                                setEditingPayment(null)
                                setActiveTab('list')
                            }}
                        />
                    )}

                    {activeTab === 'list' && (
                        <PaymentTable
                            payments={payments}
                            onEdit={handleEditPayment}
                            onDelete={handleDeletePayment}
                        />
                    )}
                </>
            )}
        </div>
    )
}
