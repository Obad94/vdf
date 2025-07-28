# VDF (Verifiable Delay Function) WebAssembly Library

> **Forked and Updated from [autonomys/vdf](https://github.com/autonomys/vdf)**  
> Original repository archived in 2022 - This fork brings the VDF library back to life with modern compatibility and fixes.

A high-performance WebAssembly implementation of Verifiable Delay Functions (VDF) supporting both Pietrzak and Wesolowski algorithms. This library allows you to generate and verify cryptographic proofs that require a specific number of sequential iterations, making it useful for time-locked proofs and proof-of-time mechanisms.

## Credits

This project is a fork of the original VDF WebAssembly library created by **Nazar Mokrynskyi** and the **Autonomys** team. The original work provided the foundation for:
- Rust-based VDF implementations (Pietrzak and Wesolowski algorithms)
- WebAssembly bindings and memory management
- TypeScript wrapper interfaces

### Original Contributors
- **Subspace Labs** (2019) - Original copyright holders
- **Nazar Mokrynskyi** - Original author and primary developer
- **Autonomys Team** - Project maintainers and contributors

### Current Fork Maintainer
- **Obad94** (2025) - Fork maintainer who brought the project back to life

This fork is maintained by [Obad94](https://github.com/Obad94) to address compatibility issues and bring the library up to modern standards with:
- Node.js 16+ compatibility
- Updated build processes and documentation
- Bug fixes for buffer reference issues
- Enhanced Ubuntu/Linux support
- Production-ready enhancements

## Features

- ✅ **Pietrzak VDF Algorithm** - Supports even iterations ≥ 66
- ✅ **Wesolowski VDF Algorithm** - More flexible iteration requirements
- ✅ **WebAssembly Performance** - High-speed cryptographic operations
- ✅ **Node.js & Browser Support** - Universal JavaScript compatibility
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Memory Management** - Automatic cleanup of WebAssembly memory
- ✅ **Modern Compatibility** - Node.js 16+ and Ubuntu 20.04+ support

## What's New in This Fork

### 🔧 **Bug Fixes**
- Fixed buffer reference errors in WebAssembly memory allocation
- Resolved Node.js compatibility issues with optional chaining operators
- Corrected TypeScript linting and compilation errors

### 🚀 **Improvements**
- Updated to Node.js 16+ for modern JavaScript features
- Enhanced build scripts with automatic buffer reference fixing
- Comprehensive Ubuntu Linux build instructions
- Improved error handling and debugging capabilities

### 📚 **Documentation**
- Complete installation guide for Ubuntu/Linux
- Step-by-step build instructions with troubleshooting
- Performance testing examples and optimization tips
- Advanced configuration options

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04+ (recommended), Debian 10+, or other Linux distributions
- **Architecture**: x86_64 or ARM64
- **Memory**: At least 4GB RAM recommended for compilation

### Required Tools

1. **Node.js 16+** (Node.js 12 has compatibility issues with modern JavaScript features)
2. **Rust** (latest stable version)
3. **Emscripten SDK** (for WebAssembly compilation)
4. **Build tools** (gcc, make, cmake, python3)

## Installation Guide

### 1. Update System Packages

```bash
# Update package lists
sudo apt update
sudo apt upgrade -y

# Install essential build tools
sudo apt install -y curl wget git build-essential cmake python3 python3-pip
```

### 2. Install Node.js 16+

Using Node Version Manager (nvm) - **Recommended**:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc
# Or restart your terminal

# Install and use Node.js 16
nvm install 16
nvm use 16
nvm alias default 16

# Verify installation
node --version  # Should show v16.x.x
npm --version   # Should show 8.x.x
```

Alternative - Using Ubuntu package manager:

```bash
# Remove old Node.js versions if present
sudo apt remove nodejs npm -y

# Install Node.js 16 from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Rust

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow the on-screen instructions, choose option 1 (default installation)
# Reload shell configuration
source ~/.cargo/env

# Add WebAssembly target
rustup target add wasm32-unknown-emscripten

# Verify installation
rustc --version
cargo --version
```

### 4. Install Emscripten SDK

```bash
# You can install Emscripten SDK either in your home directory or directly in the project directory.
# The build system will automatically detect and use ./emsdk (project-local) or ~/tools/emsdk (global).

# Option 1: Project-local (recommended for portability)
cd /path/to/your/vdf/project
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Option 2: Global (in your home directory)
cd ~
mkdir -p ~/tools
cd ~/tools
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# (Optional) Add to your shell profile for persistence (if using global install)
echo "source ~/tools/emsdk/emsdk_env.sh" >> ~/.bashrc
source ~/.bashrc

# Verify installation
emcc --version
```

### 5. Install Additional Dependencies

```bash
# Install Python dependencies if needed
sudo apt install -y python3-setuptools

# Install additional build dependencies
sudo apt install -y libc6-dev pkg-config libssl-dev
```

## Quick Start

```bash
# Clone this fork
git clone https://github.com/your-username/vdf.git
cd vdf

# Install Node.js dependencies
npm install

# Build everything (WebAssembly + TypeScript + Tests)
npm run build

# Run tests
npm test
```

## Build Commands

### Complete Build Process

```bash
# Method 1: Using npm build script (recommended)
npm run build

# Method 2: Using the build script directly
./build.sh

# Method 3: Manual step-by-step build
# Activate Emscripten environment (project-local or global)
if [ -f ./emsdk/emsdk_env.sh ]; then
  source ./emsdk/emsdk_env.sh
else
  source ~/tools/emsdk/emsdk_env.sh
fi
cargo clean
cargo build --target wasm32-unknown-emscripten
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js
npx tslint --project .
npx tsc
mkdir -p dist
npx uglify-es dist/index.js > dist/index.min.js
cp src/vdf.* dist/
```

### Individual Build Steps

#### 1. WebAssembly Build

```bash
# Ensure Emscripten environment is loaded (project-local or global)
if [ -f ./emsdk/emsdk_env.sh ]; then
  source ./emsdk/emsdk_env.sh
else
  source ~/tools/emsdk/emsdk_env.sh
fi

# Clean previous builds
cargo clean

# Debug build (faster compilation)
cargo build --target wasm32-unknown-emscripten

# Release build (optimized, slower compilation)
cargo build --target wasm32-unknown-emscripten --release

# Check build output
ls -la target/wasm32-unknown-emscripten/debug/
```

#### 2. Fix Buffer References

```bash
# Fix buffer reference issues in generated JavaScript
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js

# Verify the fix was applied
grep -n "HEAPU8.buffer" src/vdf.js
```

#### 3. TypeScript Compilation

```bash
# Lint TypeScript code
npx tslint --project .

# Compile TypeScript to JavaScript
npx tsc

# Check compiled output
ls -la dist/
```

#### 4. Minification and Packaging

```bash
# Create distribution directory
mkdir -p dist

# Minify JavaScript (optional for production)
npx uglify-es dist/index.js > dist/index.min.js

# Copy WebAssembly files to distribution
cp src/vdf.js dist/
cp src/vdf.wasm dist/

# Verify distribution contents
ls -la dist/
```

### Cargo-Specific Commands

```bash
# Build with different optimization levels
cargo build --target wasm32-unknown-emscripten                    # Debug build
cargo build --target wasm32-unknown-emscripten --release          # Release build

# Clean build artifacts
cargo clean

# Check Rust code without building
cargo check --target wasm32-unknown-emscripten

# Run Rust tests (if any)
cargo test

# Update dependencies
cargo update

# Show dependency tree
cargo tree

# Build with verbose output for debugging
cargo build --target wasm32-unknown-emscripten --verbose

# Check for specific target availability
rustup target list | grep wasm32-unknown-emscripten
```

### npm Scripts Available

```bash
# Build everything (WebAssembly + TypeScript + packaging)
npm run build

# Clean build artifacts
npm run clean

# Run TypeScript linter only
npm run lint

# Run tests (includes full build)
npm test

# Run tests without rebuilding
npm run test-only

# Individual steps (if you modify package.json to include them)
npm run build-wasm      # Would run: source emsdk && cargo build
npm run fix-buffer      # Would run: sed command for buffer fix
npm run compile         # Would run: tsc
npm run minify          # Would run: uglify-es
```

## Testing

### Run All Tests

```bash
# Complete test suite (includes build + lint + tests)
npm test

# Test output should show:
# TAP version 13
# # Basic test
# ok 1 Proof generated correctly
# ok 2 Proof is valid
# ok 3 Proof is not valid #1
# ok 4 Proof is not valid #2
# 1..4
# # tests 4
# # pass  4
# # ok
```

### Test Individual Components

```bash
# Run only TypeScript tests (skip build)
npm run test-only

# Run with verbose output
./node_modules/.bin/ts-node ./node_modules/.bin/tape tests/**/*.ts

# Test with debugging
node --inspect-brk ./node_modules/.bin/ts-node ./node_modules/.bin/tape tests/basic.ts

# Check if WebAssembly files exist
ls -la src/vdf.*
ls -la dist/vdf.*

# Verify memory allocation functions are available
node -e "
const vdf = require('./dist/index.js');
vdf().then(instance => {
  console.log('Available functions:', Object.keys(instance._lib_internal));
  console.log('allocateBytes:', typeof instance._lib_internal.allocateBytes);
  console.log('_generate:', typeof instance._lib_internal._generate);
  console.log('_verify:', typeof instance._lib_internal._verify);
});
"
```

## Development Workflow

### Complete Development Setup

```bash
# 1. Initial setup
git clone https://github.com/your-username/vdf.git
cd vdf
npm install

# 2. Setup environment (run once per session)
source ~/tools/emsdk/emsdk_env.sh

# 3. Development cycle
npm run build    # Build everything
npm test         # Run tests
# Make changes to src/main.rs or src/index.ts
npm run build    # Rebuild
npm test         # Test again
```

### Iterative Development

```bash
# For Rust changes
cargo build --target wasm32-unknown-emscripten
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js
npm run test-only

# For TypeScript changes
npx tsc
npm run test-only

# For testing only
npm run test-only
```

### Performance Testing

```bash
# Build optimized version
cargo build --target wasm32-unknown-emscripten --release
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js

# Test with different parameters
node -e "
const vdf = require('./dist/index.js');
vdf().then(async instance => {
  console.time('VDF Generation');
  const proof = instance.generate(1000, new Uint8Array([0xaa]), 2048, false);
  console.timeEnd('VDF Generation');
  
  console.time('VDF Verification');
  const isValid = instance.verify(1000, new Uint8Array([0xaa]), proof, 2048, false);
  console.timeEnd('VDF Verification');
  
  console.log('Proof valid:', isValid);
});
"
```

## Troubleshooting

### Common Issues Fixed in This Fork

**1. Buffer Reference Errors (FIXED)**
```
ReferenceError: buffer is not defined
```
**Solution**: Automatically fixed by build script using `HEAPU8.buffer`

**2. Optional Chaining Syntax Error (FIXED)**
```
SyntaxError: Unexpected token '.'
```
**Solution**: Requires Node.js 16+ which supports optional chaining (`?.`)

**3. Build Dependencies Missing (DOCUMENTED)**
**Solution**: Complete installation guide provided for Ubuntu/Linux

### Build Issues

**1. Emscripten not found**
```bash
# Check if emcc is available
which emcc

# Reload environment
source ~/tools/emsdk/emsdk_env.sh

# Reinstall if needed
cd ~/tools/emsdk
./emsdk install latest
./emsdk activate latest
```

**2. Rust target missing**
```bash
# Add WebAssembly target
rustup target add wasm32-unknown-emscripten

# List available targets
rustup target list | grep wasm

# Update Rust
rustup update
```

**3. Node.js version issues**
```bash
# Check Node.js version
node --version

# Should be 16.x.x or higher
# Update if needed using nvm
nvm install 16
nvm use 16
```

**4. Permission errors**
```bash
# Fix permissions for npm scripts
chmod +x build.sh
find node_modules/.bin -type f -exec chmod +x {} \;

# Or run with explicit node
node node_modules/.bin/ts-node node_modules/.bin/tape tests/**/*.ts
```

### Debugging Build Process

```bash
# Enable verbose output
export EMCC_DEBUG=1
cargo build --target wasm32-unknown-emscripten --verbose

# Check generated files
ls -la src/vdf.*
file src/vdf.wasm
head -20 src/vdf.js

# Test memory allocation functions
node -e "
const vdf = require('./src/vdf.js');
vdf().then(instance => {
  console.log('Module loaded successfully');
  console.log('Available functions:', Object.getOwnPropertyNames(instance));
  console.log('allocateBytes type:', typeof instance.allocateBytes);
});
"
```

## Usage Examples

### Basic VDF Generation and Verification

```typescript
import vdf from '@subspace/vdf';

async function basicExample() {
    // Initialize the VDF library
    const vdfInstance = await vdf();
    
    // Parameters
    const iterations = 1000;
    const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
    const intSizeBits = 2048;
    const isPietrzak = false; // Use Wesolowski algorithm
    
    // Generate proof
    console.time('VDF Generation');
    const proof = vdfInstance.generate(
        iterations,
        challenge,
        intSizeBits,
        isPietrzak
    );
    console.timeEnd('VDF Generation');
    
    console.log('Generated proof length:', proof.length);
    console.log('Generated proof (hex):', Buffer.from(proof).toString('hex'));
    
    // Verify proof
    console.time('VDF Verification');
    const isValid = vdfInstance.verify(
        iterations,
        challenge,
        proof,
        intSizeBits,
        isPietrzak
    );
    console.timeEnd('VDF Verification');
    
    console.log('Proof is valid:', isValid);
}

basicExample().catch(console.error);
```

### Testing Different Algorithms

```javascript
const vdf = require('@subspace/vdf');

async function compareAlgorithms() {
    const vdfInstance = await vdf();
    const challenge = new Uint8Array([0x12, 0x34, 0x56]);
    const iterations = 1000; // Must be even for Pietrzak
    const intSizeBits = 2048;
    
    // Test Wesolowski VDF
    console.log('Testing Wesolowski VDF...');
    console.time('Wesolowski Generation');
    const wesolowskiProof = vdfInstance.generate(iterations, challenge, intSizeBits, false);
    console.timeEnd('Wesolowski Generation');
    
    console.time('Wesolowski Verification');
    const wesolowskiValid = vdfInstance.verify(iterations, challenge, wesolowskiProof, intSizeBits, false);
    console.timeEnd('Wesolowski Verification');
    
    // Test Pietrzak VDF
    console.log('Testing Pietrzak VDF...');
    console.time('Pietrzak Generation');
    const pietrzakProof = vdfInstance.generate(iterations, challenge, intSizeBits, true);
    console.timeEnd('Pietrzak Generation');
    
    console.time('Pietrzak Verification');
    const pietrzakValid = vdfInstance.verify(iterations, challenge, pietrzakProof, intSizeBits, true);
    console.timeEnd('Pietrzak Verification');
    
    console.log('Results:');
    console.log('- Wesolowski proof length:', wesolowskiProof.length, 'valid:', wesolowskiValid);
    console.log('- Pietrzak proof length:', pietrzakProof.length, 'valid:', pietrzakValid);
}

compareAlgorithms().catch(console.error);
```

## Algorithm Selection

**Wesolowski VDF** (Default):
- More flexible iteration requirements
- Generally faster for most use cases
- Recommended for most applications

**Pietrzak VDF**:
- Requires even iterations ≥ 66
- Different security assumptions
- Use when specifically required

```typescript
// Wesolowski VDF
const proof1 = vdfInstance.generate(1000, challenge, 2048, false);

// Pietrzak VDF (iterations must be even and ≥ 66)
const proof2 = vdfInstance.generate(1000, challenge, 2048, true);
```

### Security Parameters

- **intSizeBits**: RSA modulus size (1024, 2048, 3072, 4096)
  - Higher = more secure, slower
  - 2048 bits recommended for most applications
- **iterations**: Number of sequential steps required
  - Higher = longer proof generation time
  - Must be even and ≥ 66 for Pietrzak

## File Structure

```
vdf/
├── src/
│   ├── main.rs              # Rust WebAssembly exports
│   ├── index.ts             # TypeScript wrapper
│   ├── bytes_allocation.js  # Memory management helpers
│   ├── vdf.js              # Generated JavaScript (from cargo build)
│   └── vdf.wasm            # Generated WebAssembly (from cargo build)
├── tests/
│   └── basic.ts            # Test suite
├── dist/                   # Built library (from npm run build)
│   ├── index.js            # Compiled TypeScript
│   ├── index.d.ts          # TypeScript definitions
│   ├── index.min.js        # Minified JavaScript
│   ├── vdf.js              # Copied from src/
│   └── vdf.wasm            # Copied from src/
├── target/                 # Rust build artifacts (from cargo build)
│   └── wasm32-unknown-emscripten/
├── .cargo/
│   └── config.toml         # Rust build configuration
├── build.sh                # Build script (chmod +x)
├── Cargo.toml              # Rust package configuration
├── package.json            # Node.js package configuration
├── tsconfig.json           # TypeScript configuration
├── tslint.json            # TypeScript linting rules
├── .gitignore              # Git ignore rules
└── README.md              # This file
```

## Contributing

We welcome contributions to this fork! The original project was archived, so this is now the active development branch maintained by [Obad94](https://github.com/Obad94).

1. Fork this repository
2. Install development dependencies: `npm install`
3. Make your changes to `src/main.rs` or `src/index.ts`
4. Run tests: `npm test`
5. Build the library: `npm run build`
6. Submit a pull request

### Areas for Contribution
- Further Node.js and browser compatibility improvements
- Performance optimizations
- Additional VDF algorithm implementations
- Enhanced error handling and debugging
- Cross-platform build support (Windows, macOS)

## License

MIT License - see LICENSE file for details

This fork maintains the same MIT license as the original project:
- **Original Copyright**: Subspace Labs (2019)
- **Current Fork**: Obad94 (2025)
- **Original Authors**: Nazar Mokrynskyi and Autonomys Team

## Original Repository

- **Original Repository**: [autonomys/vdf](https://github.com/autonomys/vdf) (archived)
- **Original Author**: Nazar Mokrynskyi <nazar@mokrynskyi.com>
- **Archived**: 2022
- **This Fork**: [github.com/Obad94/vdf](https://github.com/Obad94/vdf) - Maintained by Obad94

## Support

For issues and questions about this fork:
1. Check the troubleshooting section above
2. Review existing GitHub issues in this repository: [github.com/Obad94/vdf/issues](https://github.com/Obad94/vdf/issues)
3. Create a new issue with detailed error messages and system information
4. Include your Ubuntu version: `lsb_release -a`
5. Include Node.js version: `node --version`
6. Include Rust version: `rustc --version`
7. Include build output and error messages

For historical context about the original implementation, refer to the [archived repository](https://github.com/autonomys/vdf).

---

**Note**: This library requires modern JavaScript features and Node.js 16+. All commands have been tested on Ubuntu 20.04 LTS and newer versions. This fork addresses the compatibility issues that prevented the original library from working with modern Node.js versions.

## Changelog

### Fork Updates by Obad94 (2025)
- ✅ Fixed buffer reference errors in WebAssembly memory allocation
- ✅ Added Node.js 16+ compatibility
- ✅ Enhanced build scripts with automatic fixes
- ✅ Complete Ubuntu/Linux installation documentation
- ✅ Improved error handling and debugging
- ✅ All tests now pass consistently
- ✅ Modern TypeScript compilation support
- ✅ Production-ready build system
- ✅ Comprehensive test suite
- ✅ Enhanced package.json with proper metadata

### Original Version (2022 and earlier)
- Initial Rust implementation of VDF algorithms
- WebAssembly bindings and compilation
- TypeScript wrapper interface
- Basic test suite
- Memory management helpers
