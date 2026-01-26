-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  servicio TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  monto_pagado DECIMAL(10, 2) DEFAULT 0,
  estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'Pagado', 'Semi-pagado')),
  cuenta_origen TEXT,
  persona TEXT NOT NULL,
  mes TEXT NOT NULL,
  año INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_persona ON pagos(persona);
CREATE INDEX IF NOT EXISTS idx_pagos_servicio ON pagos(servicio);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_mes_año ON pagos(mes, año);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (para desarrollo)
-- IMPORTANTE: En producción, debes configurar políticas más restrictivas
CREATE POLICY "Enable all access for all users" ON pagos
FOR ALL
USING (true)
WITH CHECK (true);

-- Insertar datos de ejemplo basados en la imagen
INSERT INTO pagos (fecha, servicio, monto, monto_pagado, estado, cuenta_origen, persona, mes, año) VALUES
('2026-01-15', 'HIDRANDINA', 124.10, 124.10, 'Pagado', 'INTERBANK', 'Usuario 1', 'ENERO', 2026),
('2026-01-15', 'QUAVII', 62.70, 62.70, 'Pagado', 'INTERBANK', 'Usuario 1', 'ENERO', 2026),
('2026-01-05', 'SEDALIB', 60.90, 60.90, 'Pagado', 'INTERBANK', 'Usuario 1', 'ENERO', 2026),
('2026-02-01', 'HIDRANDINA', 130.00, 0, 'Pendiente', NULL, 'Usuario 1', 'FEBRERO', 2026),
('2026-02-01', 'QUAVII', 65.00, 0, 'Pendiente', NULL, 'Usuario 1', 'FEBRERO', 2026),
('2026-02-01', 'SEDALIB', 62.00, 0, 'Pendiente', NULL, 'Usuario 1', 'FEBRERO', 2026),
('2026-02-01', 'LICUADORA', 474.00, 200.00, 'Semi-pagado', 'INTERBANK', 'Usuario 2', 'FEBRERO', 2026),
('2026-03-01', 'QUAVII', 70.00, 0, 'Pendiente', NULL, 'Usuario 1', 'MARZO', 2026),
('2026-03-01', 'SEDALIB', 58.00, 0, 'Pendiente', NULL, 'Usuario 1', 'MARZO', 2026),
('2026-04-01', 'HIDRANDINA', 135.00, 0, 'Pendiente', NULL, 'Usuario 1', 'ABRIL', 2026),
('2026-04-01', 'QUAVII', 68.00, 0, 'Pendiente', NULL, 'Usuario 1', 'ABRIL', 2026),
('2026-04-01', 'SEDALIB', 61.00, 0, 'Pendiente', NULL, 'Usuario 1', 'ABRIL', 2026);
