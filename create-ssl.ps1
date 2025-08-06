# PowerShell script to create SSL certificates for localhost
Write-Host "🔐 Creating SSL certificates for localhost..." -ForegroundColor Green

try {
    # Create certificate using PowerShell
    $cert = New-SelfSignedCertificate -DnsName "localhost", "127.0.0.1" -CertStoreLocation "cert:\LocalMachine\My" -FriendlyName "InterviewPro Localhost SSL" -NotAfter (Get-Date).AddYears(1) -KeyAlgorithm RSA -KeyLength 2048 -KeyUsage DigitalSignature, KeyEncipherment -Type SSLServerAuthentication
    
    Write-Host "✅ Certificate created successfully!" -ForegroundColor Green
    Write-Host "Certificate Thumbprint: $($cert.Thumbprint)" -ForegroundColor Yellow
    
    # Export certificate to PEM format
    $certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"
    
    # Export private key
    $privateKey = [System.Security.Cryptography.X509Certificates.X509Certificate2]$certPath
    $privateKeyBytes = $privateKey.PrivateKey.ExportCspBlob($true)
    [System.IO.File]::WriteAllBytes("localhost-key.pem", $privateKeyBytes)
    
    # Export certificate
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    [System.IO.File]::WriteAllBytes("localhost.pem", $certBytes)
    
    Write-Host "✅ SSL certificates exported to localhost.pem and localhost-key.pem" -ForegroundColor Green
    Write-Host "🚀 You can now run: npm start" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error creating certificate: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Alternative: Use Live Server with localhost" -ForegroundColor Yellow
    Write-Host "Run: npm run dev" -ForegroundColor Cyan
    Write-Host "Access: http://localhost:8000" -ForegroundColor Cyan
} 