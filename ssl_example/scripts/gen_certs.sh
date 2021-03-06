# Output files
# ca.key: Certificate Authority private key file (this shouldn't be shared in real-life)
# ca.crt: Certificate Authority trust certificate (this should be shared with users in real-life)
# server.key: Server private key, password protected (this shouldn't be shared)
# server.csr: Server certificate signing request (this should be shared with the CA owner)
# server.crt: Server certificate signed by the CA (this would be sent back by the CA owner) - keep on server
# Summary
# Private files: ca.key, server.key, server.pem (We don't need this, in our case), server.crt
# "Share" files: ca.crt (needed by the client), server.csr (needed by the CA)

echo "Creating certs folder ..."

mkdir certs && cd certs

echo "Generating certificates ..."

# This command generates RSA private key for CA Root
openssl genrsa -passout pass:1111 -aes256 -out ca.key 4096

# This command creates and extracts the encrypted RSA private key for CA Root
openssl req -passin pass:1111 -new -x509 -days 365 -key ca.key -out ca.crt -subj  "/C=US/ST=WA/L=Seattle/O=Test/OU=Test/CN=ca"

# We can use this CA certificate to create a server certificate that can be used for the SSL connection
openssl genrsa -passout pass:1111 -aes256 -out server.key 4096

# This command creates and extracts the encrypted RSA private key for Server
openssl req -passin pass:1111 -new -key server.key -out server.csr -subj  "/C=US/ST=WA/L=Seattle/O=Test/OU=Server/CN=example.com"

# This command creates a certificate creation request. We sign the server certificate with the CA Root
openssl x509 -req -passin pass:1111 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

# This command creates an encrypted RSA private key for Server
openssl rsa -passin pass:1111 -in server.key -out server.key

# With this command, we self sign the server certificate
openssl genrsa -passout pass:1111 -aes256 -out client.key 4096

# This command creates an encrypted RSA private key for Client
openssl req -passin pass:1111 -new -key client.key -out client.csr -subj  "/C=US/ST=WA/L=Seattle/O=Test/OU=Client/CN=example.com"

# This command creates a certificate creation request. We sign the client certificate with the CA Root
openssl x509 -passin pass:1111 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt

# This command creates an encrypted RSA private key for Client
openssl rsa -passin pass:1111 -in client.key -out client.key
