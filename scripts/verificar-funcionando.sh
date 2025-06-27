#!/bin/bash

# 🔍 Script de Verificación Automática del Carnet 3D

echo "🔍 Verificando que el carnet 3D siga funcionando..."

# Verificar que archivos críticos existen
echo "📁 Verificando archivos críticos..."
if [ ! -f "tsconfig.json" ]; then
    echo "❌ ERROR: tsconfig.json no existe"
    exit 1
fi

if [ ! -f "src/components/lanyard/LanyardFinal.tsx" ]; then
    echo "❌ ERROR: LanyardFinal.tsx no existe"
    exit 1
fi

if [ ! -f "src/types/jsx.d.ts" ]; then
    echo "❌ ERROR: jsx.d.ts no existe"
    exit 1
fi

if [ ! -f "public/Lanyard/card.glb" ]; then
    echo "❌ ERROR: card.glb no existe en public/Lanyard/"
    exit 1
fi

if [ ! -f "public/Lanyard/lanyard.png" ]; then
    echo "❌ ERROR: lanyard.png no existe en public/Lanyard/"
    exit 1
fi

echo "✅ Todos los archivos críticos existen"

# Verificar TypeScript
echo "🔍 Verificando TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ TypeScript compila sin errores"
else
    echo "❌ ERROR: Errores de TypeScript detectados"
    echo "🔄 Ejecuta: npm run restaurar-funcionando"
    exit 1
fi

# Verificar que el build funciona
echo "🔍 Verificando build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build exitoso"
else
    echo "❌ ERROR: Build falló"
    echo "🔄 Ejecuta: npm run restaurar-funcionando"
    exit 1
fi

echo ""
echo "🎉 ¡CARNET 3D VERIFICADO COMO FUNCIONAL!"
echo "✅ Todos los sistemas operando correctamente"
echo ""