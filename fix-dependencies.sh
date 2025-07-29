#!/bin/bash
# fix-dependencies.sh - Add required dependencies and rebuild

set -euo pipefail

echo "🔧 Adding required Rust dependencies..."

# Add the missing dependencies
cargo add classgroup@0.1
cargo add sha2@0.8
cargo add num-traits@0.2

echo "✅ Dependencies added successfully"

# Update Cargo.toml for WebAssembly optimization
echo "📝 Optimizing Cargo.toml for WebAssembly..."

# Check if the profile sections exist, if not add them
if ! grep -q "\[profile.release\]" Cargo.toml; then
    echo "" >> Cargo.toml
    echo "# Memory optimization for WebAssembly" >> Cargo.toml
    echo "[profile.release]" >> Cargo.toml
    echo "opt-level = \"s\"        # Optimize for size" >> Cargo.toml
    echo "lto = true            # Link-time optimization" >> Cargo.toml
    echo "codegen-units = 1     # Better optimization" >> Cargo.toml
    echo "panic = \"abort\"       # Smaller binary size" >> Cargo.toml
    echo "" >> Cargo.toml
    echo "[profile.dev]" >> Cargo.toml
    echo "opt-level = 1         # Some optimization even in dev" >> Cargo.toml
    echo "overflow-checks = true # Safety checks" >> Cargo.toml
fi

echo "📦 Current dependencies in Cargo.toml:"
grep -A 20 "\[dependencies\]" Cargo.toml || echo "No dependencies section found"

echo ""
echo "🔄 Ready to build! Run './build.sh' to continue..."
echo ""
echo "💡 If you still get dependency errors, you may need to:"
echo "   1. cargo clean"
echo "   2. rm Cargo.lock" 
echo "   3. cargo update"
echo "   4. ./build.sh"