#!/bin/bash
mkdir -p certs
cd certs

# 1. Generate Private Key
openssl genrsa -out signerKey.pem 2048

# 2. Generate Self-Signed Certificate (Acting as Signer)
openssl req -new -key signerKey.pem -out signerCsr.pem -subj "/CN=Defrag Dev Pass/O=Defrag/C=US"
openssl x509 -req -days 365 -in signerCsr.pem -signkey signerKey.pem -out signerCert.pem

# 3. Download Apple WWDR Certificate (Required by passkit-generator logic, even if self-signed)
# This is the public Apple CA cert.
curl -s -L -o wwdr.pem https://www.apple.com/certificateauthority/AppleWWDRCAG4.pem

# 4. Create Passphrase-less key if needed (the above is usually unencrypted)
# If passkit-generator complains about password, we might need to adjust.

echo "✅ Dev Certs Generated in ./certs"
