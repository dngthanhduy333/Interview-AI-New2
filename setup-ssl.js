const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up SSL certificates for localhost...');

try {
    // Check if certificates already exist
    if (fs.existsSync('localhost-key.pem') && fs.existsSync('localhost.pem')) {
        console.log('✅ SSL certificates already exist');
        return;
    }

    // Generate SSL certificate for localhost
    console.log('📝 Generating SSL certificate...');
    
    // Create certificate using mkcert or openssl
    try {
        // Try mkcert first (if installed)
        execSync('mkcert -install', { stdio: 'inherit' });
        execSync('mkcert localhost 127.0.0.1 ::1', { stdio: 'inherit' });
        
        // Rename files to match our server
        if (fs.existsSync('localhost+2.pem')) {
            fs.renameSync('localhost+2.pem', 'localhost.pem');
        }
        if (fs.existsSync('localhost+2-key.pem')) {
            fs.renameSync('localhost+2-key.pem', 'localhost-key.pem');
        }
        
        console.log('✅ SSL certificates created successfully with mkcert');
        
    } catch (mkcertError) {
        console.log('⚠️  mkcert not found, trying openssl...');
        
        // Fallback to openssl
        const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = Organizational Unit
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
`;

        fs.writeFileSync('openssl.conf', opensslConfig);
        
        execSync('openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -config openssl.conf -extensions v3_req', { stdio: 'inherit' });
        
        // Clean up config file
        fs.unlinkSync('openssl.conf');
        
        console.log('✅ SSL certificates created successfully with openssl');
    }
    
    console.log('🎉 SSL setup complete! You can now run: npm start');
    
} catch (error) {
    console.error('❌ Error setting up SSL certificates:', error.message);
    console.log('\n📋 Manual setup instructions:');
    console.log('1. Install mkcert: https://github.com/FiloSottile/mkcert');
    console.log('2. Run: mkcert -install');
    console.log('3. Run: mkcert localhost 127.0.0.1 ::1');
    console.log('4. Rename the generated files to localhost.pem and localhost-key.pem');
    console.log('5. Run: npm start');
} 