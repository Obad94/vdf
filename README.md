# VDF (Verifiable Delay Function) WebAssembly Library

A high-performance WebAssembly implementation of Verifiable Delay Functions (VDF) supporting both Pietrzak and Wesolowski algorithms. This library allows you to generate and verify cryptographic proofs that require a specific number of sequential iterations, making it useful for time-locked proofs and proof-of-time mechanisms.

## Features

- ✅ **Pietrzak VDF Algorithm** - Supports even iterations ≥ 66
- ✅ **Wesolowski VDF Algorithm** - More flexible iteration requirements
- ✅ **WebAssembly Performance** - High-speed cryptographic operations
- ✅ **Node.js & Browser Support** - Universal JavaScript compatibility
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Memory Management** - Automatic cleanup of WebAssembly memory

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
# Create a directory for emscripten (optional but recommended)
cd ~
mkdir -p ~/tools
cd ~/tools

# Clone Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install and activate latest version
./emsdk install latest
./emsdk activate latest

# Set up environment variables
source ./emsdk_env.sh

# Add to your shell profile for persistence
echo "source ~/tools/emsdk/emsdk_env.sh" >> ~/.bashrc

# Reload shell configuration
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

## Project Setup

### 1. Clone and Setup Project

```bash
# Navigate to your projects directory
cd ~
mkdir -p ~/projects
cd ~/projects

# Clone the repository
git clone <your-vdf-repo-url>
cd vdf

# Install Node.js dependencies
npm install

# Install missing dependencies if needed
npm install arg
```

### 2. Configure Rust/WebAssembly Build

The project includes pre-configured build settings:

**Cargo.toml**:
```toml
[package]
name = "vdf"
version = "0.1.0"
authors = ["Your Name <email@example.com>"]
edition = "2021"

[dependencies]
vdf = "0.1"
```

**.cargo/config.toml**:
```toml
[target.wasm32-unknown-emscripten]
rustflags = [
  "-C", 
  "link-args=-L .cache/lib --closure 0 -Oz --llvm-lto 3 -s EXPORTED_RUNTIME_METHODS=[] -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=[] -s EXPORTED_FUNCTIONS=['_malloc','_free','_generate','_verify'] -s MODULARIZE=1 -s WASM=1 --post-js src/bytes_allocation.js"
]
```

### 3. Build WebAssembly Module

```bash
# Ensure Emscripten environment is loaded
source ~/tools/emsdk/emsdk_env.sh

# Clean previous builds
cargo clean

# Build WebAssembly module
cargo build --target wasm32-unknown-emscripten

# The build generates:
# - src/vdf.js (JavaScript wrapper)
# - src/vdf.wasm (WebAssembly binary)
```

### 4. Fix Buffer Reference Issue (if needed)

```bash
# If you encounter buffer reference errors, manually fix them
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js
```

### 5. Build JavaScript Library

```bash
# Build the complete library
npm run build

# This runs:
# 1. npm run clean    - Remove dist folder
# 2. npm run lint     - TypeScript linting  
# 3. npm run compile  - Compile TypeScript
# 4. npm run minify   - Minify JavaScript
# 5. npm run copy-wasm-js - Copy WebAssembly files
```

## Testing

### Run Tests

```bash
# Run all tests (includes linting)
npm test

# Run tests without linting (for development)
./node_modules/.bin/ts-node ./node_modules/.bin/tape tests/**/*.ts

# If you get permission errors, make the script executable
chmod +x ./node_modules/.bin/ts-node
chmod +x ./node_modules/.bin/tape
```

### Test Output

Successful test output should show:
```
TAP version 13
# Basic test
Available properties: [
  '_generate', '_verify', '_malloc', '_free',
  'calledRun', 'createPointer', 'allocatePointer',
  'allocateBytes', 'freeBytes'
]
allocatePointer available: function
allocateBytes available: function
_malloc available: function
_free available: function
ok 1 Proof generated correctly
ok 2 Proof is valid
ok 3 Proof is not valid #1
ok 4 Proof is not valid #2

1..4
# tests 4
# pass  4

# ok
```

## Usage

### Basic Example

```typescript
import vdf from '@subspace/vdf';

async function example() {
    // Initialize the VDF library
    const vdfInstance = await vdf();
    
    // Parameters
    const iterations = 1000;
    const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
    const intSizeBits = 2048;
    const isPietrzak = false; // Use Wesolowski algorithm
    
    // Generate proof
    const proof = vdfInstance.generate(
        iterations,
        challenge,
        intSizeBits,
        isPietrzak
    );
    
    console.log('Generated proof:', proof);
    
    // Verify proof
    const isValid = vdfInstance.verify(
        iterations,
        challenge,
        proof,
        intSizeBits,
        isPietrzak
    );
    
    console.log('Proof is valid:', isValid);
}

example().catch(console.error);
```

### Algorithm Selection

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

## Troubleshooting

### Common Issues

**1. Permission Denied Errors**
```bash
# Fix permissions for node_modules binaries
find node_modules/.bin -type f -exec chmod +x {} \;

# Or run with explicit node
node node_modules/.bin/ts-node node_modules/.bin/tape tests/**/*.ts
```

**2. Emscripten Environment Not Found**
```bash
# Reload Emscripten environment
source ~/tools/emsdk/emsdk_env.sh

# Check if emcc is available
which emcc

# If not found, reinstall emscripten
cd ~/tools/emsdk
./emsdk install latest
./emsdk activate latest
```

**3. Rust Target Missing**
```bash
# Add WebAssembly target
rustup target add wasm32-unknown-emscripten

# Update Rust if needed
rustup update
```

**4. Optional Chaining Syntax Error**
```
SyntaxError: Unexpected token '.'
```
**Solution**: Upgrade to Node.js 16+ which supports optional chaining (`?.`)

**5. Buffer Reference Error**
```
ReferenceError: buffer is not defined
```
**Solution**: Run the sed command to fix buffer references:
```bash
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js
```

**6. Build Dependencies Missing**
```bash
# Install missing build dependencies
sudo apt install -y build-essential cmake python3-dev libffi-dev

# For older Ubuntu versions
sudo apt install -y python-dev
```

### Debug Mode

To enable debug output, modify `src/index.ts`:

```typescript
// Debug: Check what's available on the module
console.log('Available properties:', Object.getOwnPropertyNames(libInstance));
console.log('allocatePointer available:', typeof libInstance.allocatePointer);
```

### Performance Optimization

For production builds:

1. **Optimize Rust build**:
```bash
cargo build --target wasm32-unknown-emscripten --release
```

2. **Enable WebAssembly optimizations** in `.cargo/config.toml`:
```toml
rustflags = [
  "-C", "link-args=... -O3 --llvm-lto 3 ..."
]
```

3. **Clear build caches if needed**:
```bash
cargo clean
rm -rf node_modules/.cache
rm -rf dist
```

## File Structure

```
vdf/
├── src/
│   ├── main.rs              # Rust WebAssembly exports
│   ├── index.ts             # TypeScript wrapper
│   ├── bytes_allocation.js  # Memory management helpers
│   ├── vdf.js              # Generated JavaScript (build)
│   └── vdf.wasm            # Generated WebAssembly (build)
├── tests/
│   └── basic.ts            # Test suite
├── dist/                   # Built library (npm run build)
├── .cargo/
│   └── config.toml         # Rust build configuration
├── Cargo.toml              # Rust package configuration
├── package.json            # Node.js package configuration
├── tsconfig.json           # TypeScript configuration
├── tslint.json            # TypeScript linting rules
└── README.md              # This file
```

## Development Workflow

### Complete Build Process

```bash
# 1. Ensure environment is set up
source ~/tools/emsdk/emsdk_env.sh

# 2. Clean everything
cargo clean
rm -rf dist node_modules/.cache

# 3. Build WebAssembly
cargo build --target wasm32-unknown-emscripten

# 4. Fix buffer references if needed
sed -i 's/new as(buffer,pointer,size\/as\.BYTES_PER_ELEMENT)/new as(HEAPU8.buffer,pointer,size\/as.BYTES_PER_ELEMENT)/g' src/vdf.js

# 5. Build JavaScript library
npm run build

# 6. Run tests
npm test
```

### Continuous Development

```bash
# Watch for changes and rebuild (if you have nodemon installed)
npm install -g nodemon
nodemon --watch src --ext rs,ts,js --exec "cargo build --target wasm32-unknown-emscripten && npm run build"
```

## Ubuntu-Specific Notes

### Ubuntu 18.04 LTS
- May need to install newer cmake: `sudo snap install cmake --classic`
- Python 3.6+ required: `sudo apt install python3.8 python3.8-dev`

### Ubuntu 20.04 LTS
- Default packages should work fine
- Recommended for best compatibility

### Ubuntu 22.04 LTS
- All dependencies available in default repositories
- Best performance and compatibility

### WSL2 on Windows
If running on Windows Subsystem for Linux:
```bash
# Update WSL2 to latest version
wsl --update

# Install Windows Terminal for better experience
# Available from Microsoft Store

# All Linux commands work the same in WSL2
```

## Contributing

1. Fork the repository
2. Install development dependencies: `npm install`
3. Make your changes
4. Run tests: `npm test`
5. Build the library: `npm run build`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with detailed error messages and system information
4. Include your Ubuntu version: `lsb_release -a`
5. Include Node.js version: `node --version`
6. Include Rust version: `rustc --version`

---

**Note**: This library requires modern JavaScript features and Node.js 16+. All commands have been tested on Ubuntu 20.04 LTS and newer versions.

## Version History

### v0.1.0
- Initial release
- Support for Pietrzak and Wesolowski VDF algorithms
- WebAssembly implementation with Rust backend
- Node.js 16+ compatibility
- TypeScript support
- Comprehensive test suite
- Fixed buffer reference issues in memory allocation
- Proper cleanup of WebAssembly memory
- Ubuntu Linux compatibility

## Security Considerations

- This library implements cryptographic functions that require careful parameter selection
- Use appropriate iteration counts for your security requirements
- RSA modulus sizes of 2048 bits or higher are recommended for production use
- Always verify proofs before accepting them as valid
- Be aware of timing attacks and implement appropriate countermeasures if needed

## Performance Notes

- Proof generation time increases linearly with iteration count
- Higher RSA modulus sizes significantly impact performance
- WebAssembly provides near-native performance for cryptographic operations
- Consider running intensive operations in Web Workers to avoid blocking the main thread
- Build times may be longer on lower-end hardware (4+ CPU cores recommended)
