#!/bin/bash

# 🔄 Script de Restauración Automática del Carnet 3D

echo "🔄 Restaurando configuración funcionando del carnet 3D..."

# Verificar que existen los backups
if [ ! -d "backup-funcionando" ]; then
    echo "❌ ERROR: No se encontró carpeta backup-funcionando"
    echo "💡 Los backups pueden haberse perdido"
    exit 1
fi

echo "📁 Restaurando archivos desde backup..."

# Restaurar archivos críticos
cp backup-funcionando/tsconfig.json.FUNCIONANDO tsconfig.json
echo "✅ tsconfig.json restaurado"

cp backup-funcionando/LanyardFinal.tsx.FUNCIONANDO src/components/lanyard/LanyardFinal.tsx
echo "✅ LanyardFinal.tsx restaurado"

cp backup-funcionando/global.d.ts.FUNCIONANDO src/types/global.d.ts
echo "✅ global.d.ts restaurado"

cp backup-funcionando/jsx.d.ts.FUNCIONANDO src/types/jsx.d.ts
echo "✅ jsx.d.ts restaurado"

# Limpiar caché
echo "🧹 Limpiando caché..."
rm -rf .next
rm -rf tsconfig.tsbuildinfo

echo "🔍 Verificando restauración..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ TypeScript compila correctamente después de restauración"
else
    echo "⚠️ WARNING: Aún hay errores TypeScript después de restauración"
fi

echo ""
echo "🎉 ¡CONFIGURACIÓN FUNCIONANDO RESTAURADA!"
echo "🚀 Ejecuta: npm run dev"
echo "🌐 Abre: http://localhost:3001"
echo ""