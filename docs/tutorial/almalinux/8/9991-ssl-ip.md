---
title: SSL IP Let's Encrypt
description: Tutorial Cara Konfigurasi SSL IPv4 dan IPv6 Let's Encrypt
sidebar_position: 9991
sidebar_label: SSL IP Let's Encrypt
---
Let’s Encrypt, penyedia sertifikat SSL/TLS gratis dan otomatis yang dikenal luas di seluruh dunia, baru saja mencapai tonggak penting dalam pengembangan teknologinya. Untuk pertama kalinya pada bulan 1 Juli 2025, mereka mulai menerbitkan sertifikat TLS untuk IP address, bukan hanya untuk nama domain seperti sebelumnya.

Langkah ini membuka peluang baru, terutama bagi penyedia layanan dan administrator jaringan yang mengandalkan akses langsung melalui IP tanpa menggunakan nama domain.
Dengan dukungan sertifikat IP dari Let’s Encrypt, kini memungkinkan untuk mengamankan koneksi langsung ke IP menggunakan HTTPS atau protokol TLS lainnya tanpa harus mendaftarkan domain.

Dengan dukungan sertifikat IP dari Let’s Encrypt, kini memungkinkan untuk mengamankan koneksi langsung ke IP menggunakan HTTPS atau protokol TLS lainnya **tanpa harus mendaftarkan domain**.

Contoh penggunaan:

- Layanan **DNS-over-HTTPS (DoH)** yang langsung diakses lewat IP.
- Server cloud atau VPS yang memiliki IP publik tanpa nama domain.
- Perangkat rumahan atau **jaringan lokal (LAN)** yang ingin diamankan namun tidak memiliki DNS.

Sumber: https://letsencrypt.org/2025/07/01/issuing-our-first-ip-address-certificate/


## Persiapan
:::info
Pada saat artikel ini di publikasikan, Let's Encrypt masih dalam proses ujicoba. Artikel ini dibuat hanya untuk edukasi dan bukan untuk dijalankan pada production.
:::

Berikut beberapa komponen sebelum memulai instalasi Let's Encrypt IP:

- OS Linux AlmaLinux 8
- Apache Web Server
- IPv4 dan IPv6 (Public)
- Domain (FQDN)

## Konfigurasi
Install Apache:
```
dnf install httpd mod_ssl -y
```
Enable service dan cek status:
```
systemctl enable --now httpd
systemctl status httpd
```
Contoh ouput:
```
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2025-07-08 14:46:18 UTC; 232ms ago
     Docs: man:httpd.service(8)
 Main PID: 6260 (httpd)
   Status: "Started, listening on: port 80"
    Tasks: 213 (limit: 4656)
   Memory: 30.0M
...
..
.
```
Kemudian tambahkan port `80` dan `443` pada `firewalld` apabila menggunakannya:
```
firewall-cmd --add-port={80,443}/tcp --permanent
firewall-cmd --reload
```

Kemudian download `lego` karena yang baru di support untuk issue IP SSL, untuk `certbot` dan ACME client lainnya kemungkinan akan segera menyusul:
```
wget https://github.com/go-acme/lego/releases/download/v4.24.0/lego_v4.24.0_linux_amd64.tar.gz
```
Extract dan pindahkan `lego`:
```
tar -xf lego_v4.24.0_linux_amd64.tar.gz 
mv lego /usr/local/bin/
```
Verifikasi:
```
lego -v
```
Contoh output:
```
lego version 4.24.0 linux/amd64
```
### Request SSL dan Konfigurasi Virtual Host
Cek IP saat ini pada server dengan menjalankan perintah berikut:
```
hostname -I
```
Contoh output:
```
103.195.188.25 2001:df4:c140:1f::2dd 
```
Stop service `httpd` terlebih dahulu karena `lego` akan menggunakan `http` sebagai autentikasi:
```
systemctl stop httpd
```
Untuk menginstall SSL IP menggunakan Let's Encrypt sedikit cukup tricky karena seharusnya perintah tersebut cukup dijalankan seperti ini:
```
lego --http --server https://acme-staging-v02.api.letsencrypt.org/directory -m support@focusnic.com -a -d 103.195.188.25,2001:df4:c140:1f::2dd run --profile shortlived
```
Berikut outputnya:
```
2025/07/08 15:51:36 No key found for account support@focusnic.com. Generating a P256 key.
2025/07/08 15:51:36 Saved key to /root/.lego/accounts/acme-staging-v02.api.letsencrypt.org/support@focusnic.com/keys/support@focusnic.com.key
2025/07/08 15:51:37 [INFO] acme: Registering account for support@focusnic.com
!!!! HEADS UP !!!!

Your account credentials have been saved in your
configuration directory at "/root/.lego/accounts".

You should make a secure backup of this folder now. This
configuration directory will also contain certificates and
private keys obtained from the ACME server so making regular
backups of this folder is ideal.
2025/07/08 15:51:41 [INFO] [103.195.188.25, 2001:df4:c140:1f::2dd] acme: Obtaining bundled SAN certificate
2025/07/08 15:51:42 [INFO] [103.195.188.25] AuthURL: https://acme-staging-v02.api.letsencrypt.org/acme/authz/211339903/18425337633
2025/07/08 15:51:42 [INFO] [2001:df4:c140:1f::2dd] AuthURL: https://acme-staging-v02.api.letsencrypt.org/acme/authz/211339903/18425337643
2025/07/08 15:51:42 [INFO] [103.195.188.25] acme: Could not find solver for: tls-alpn-01
2025/07/08 15:51:42 [INFO] [103.195.188.25] acme: use http-01 solver
2025/07/08 15:51:42 [INFO] [2001:df4:c140:1f::2dd] acme: Could not find solver for: tls-alpn-01
2025/07/08 15:51:42 [INFO] [2001:df4:c140:1f::2dd] acme: use http-01 solver
2025/07/08 15:51:42 [INFO] [103.195.188.25] acme: Trying to solve HTTP-01
2025/07/08 15:51:43 [INFO] [103.195.188.25] Served key authentication
2025/07/08 15:51:43 [INFO] [103.195.188.25] Served key authentication
2025/07/08 15:51:43 [INFO] [103.195.188.25] Served key authentication
2025/07/08 15:51:43 [INFO] [103.195.188.25] Served key authentication
2025/07/08 15:51:44 [INFO] [103.195.188.25] Served key authentication
2025/07/08 15:51:46 [INFO] [103.195.188.25] The server validated our request
2025/07/08 15:51:46 [INFO] [2001:df4:c140:1f::2dd] acme: Trying to solve HTTP-01
2025/07/08 15:51:46 [INFO] [2001:df4:c140:1f::2dd] Served key authentication
2025/07/08 15:51:46 [INFO] [2001:df4:c140:1f::2dd] Served key authentication
2025/07/08 15:51:47 [INFO] [2001:df4:c140:1f::2dd] Served key authentication
2025/07/08 15:51:47 [INFO] [2001:df4:c140:1f::2dd] Served key authentication
2025/07/08 15:51:47 [INFO] [2001:df4:c140:1f::2dd] Served key authentication
2025/07/08 15:51:53 [INFO] [2001:df4:c140:1f::2dd] The server validated our request
2025/07/08 15:51:53 [INFO] [103.195.188.25, 2001:df4:c140:1f::2dd] acme: Validations succeeded; requesting certificates
2025/07/08 15:51:53 Could not obtain certificates:
        error: one or more domains had a problem:
103.195.188.25: acme: error: 400 :: POST :: https://acme-staging-v02.api.letsencrypt.org/acme/finalize/211339903/25919805533 :: urn:ietf:params:acme:error:badCSR :: Error finalizing order :: CSR contains IP address in Common Name
2001:df4:c140:1f::2dd: acme: error: 400 :: POST :: https://acme-staging-v02.api.letsencrypt.org/acme/finalize/211339903/25919805533 :: urn:ietf:params:acme:error:badCSR :: Error finalizing order :: CSR contains IP address in Common Name
```

Sebenarnya masih dapat dimaklumi karena mungkin masih tahap awal dalam pengembangan, dan solusinya adalah menambahkan domain FQDN dengan parameter sebagai berikut:
```
lego --http --server https://acme-staging-v02.api.letsencrypt.org/directory -m support@focusnic.com -a -d le.focusnic.com,139.180.132.61,2401:c080:1400:19b2:5400:5ff:fe87:a2b5 run --profile shortlived
```
Berikut contoh outputnya:
```
2025/07/08 15:52:51 [INFO] [le.focusnic.com, 103.195.188.25, 2001:df4:c140:1f::2dd] acme: Obtaining bundled SAN certificate
2025/07/08 15:52:52 [INFO] [le.focusnic.com] AuthURL: https://acme-staging-v02.api.letsencrypt.org/acme/authz/211339903/18425309313
2025/07/08 15:52:52 [INFO] [103.195.188.25] AuthURL: https://acme-staging-v02.api.letsencrypt.org/acme/authz/211339903/18425337633
2025/07/08 15:52:52 [INFO] [2001:df4:c140:1f::2dd] AuthURL: https://acme-staging-v02.api.letsencrypt.org/acme/authz/211339903/18425337643
2025/07/08 15:52:52 [INFO] [le.focusnic.com] acme: authorization already valid; skipping challenge
2025/07/08 15:52:52 [INFO] [103.195.188.25] acme: authorization already valid; skipping challenge
2025/07/08 15:52:52 [INFO] [2001:df4:c140:1f::2dd] acme: authorization already valid; skipping challenge
2025/07/08 15:52:52 [INFO] [le.focusnic.com, 103.195.188.25, 2001:df4:c140:1f::2dd] acme: Validations succeeded; requesting certificates
2025/07/08 15:52:52 [INFO] Wait for certificate [timeout: 30s, interval: 500ms]
2025/07/08 15:52:56 [INFO] [le.focusnic.com] Server responded with a certificate.
```
Cek file SSL:
```
ls -lah ~/.lego/certificates/
```
Berikut contoh outputnya:
```
total 16K
drwx------ 2 root root  122 Jul  8 15:52 .
drwx------ 4 root root   42 Jul  8 15:47 ..
-rw------- 1 root root 2.9K Jul  8 15:52 le.focusnic.com.crt
-rw------- 1 root root 1.7K Jul  8 15:52 le.focusnic.com.issuer.crt
-rw------- 1 root root  252 Jul  8 15:52 le.focusnic.com.json
-rw------- 1 root root  227 Jul  8 15:52 le.focusnic.com.key
```
Langkah berikutnya adalah membuat virtualhost untuk IP:
```
nano /etc/httpd/conf.d/ip-ssl.conf
```
Isi parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/ip-ssl.conf"
<VirtualHost *:443>
    ServerName _

    SSLEngine on
    SSLCertificateFile /root/.lego/certificates/le.focusnic.com.crt
    SSLCertificateKeyFile /root/.lego/certificates/le.focusnic.com.key

</VirtualHost>
```
Lalu restart `httpd`:
```
systemctl restart httpd
```
Akses IPv4
![](/img/ip-ssl-1.jpg)<br/>
Akses IPv6
![](/img/ip-ssl-2.jpg)<br/>
Decode public key IP SSL Let's Encrypt
![](/img/ip-ssl-3.jpg)<br/>
Berikut public key SSL IP dari Let's Encrypt, Anda juga bisa melakukan decode pada website berikut https://redkestrel.co.uk/tools/decoder
```jsx showLineNumbers title="le.focusnic.com.crt"
-----BEGIN CERTIFICATE-----
MIIDkzCCAxmgAwIBAgISLO4M/GrIceZs61U9AcE/LLMlMAoGCCqGSM49BAMDMFMx
CzAJBgNVBAYTAlVTMSAwHgYDVQQKExcoU1RBR0lORykgTGV0J3MgRW5jcnlwdDEi
MCAGA1UEAxMZKFNUQUdJTkcpIEZhbHNlIEZlbm5lbCBFNjAeFw0yNTA3MDgxNDU0
MjJaFw0yNTA3MTUwNjU0MjFaMAAwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATu
0+Ft4FLlsHY9dtWdpgOI6bwZJHPo7iujs+FJC43Tt1JQfJ6ovrxJyOvsOs1swzzX
8koxId65dDSSQAmVqLUTo4ICHjCCAhowDgYDVR0PAQH/BAQDAgeAMBMGA1UdJQQM
MAoGCCsGAQUFBwMBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUoXQaBm1Qt4Yt
SizBfrSNiElszRYwNgYIKwYBBQUHAQEEKjAoMCYGCCsGAQUFBzAChhpodHRwOi8v
c3RnLWU2LmkubGVuY3Iub3JnLzA1BgNVHREBAf8EKzApgg9sZS5mb2N1c25pYy5j
b22HBGfDvBmHECABDfTBQAAfAAAAAAAAAt0wEwYDVR0gBAwwCjAIBgZngQwBAgEw
MQYDVR0fBCowKDAmoCSgIoYgaHR0cDovL3N0Zy1lNi5jLmxlbmNyLm9yZy8zOC5j
cmwwggELBgorBgEEAdZ5AgQCBIH8BIH5APcAdgCwzIPlpfl9a698CcwoSQSHKsfo
ixMsY1C3xv0m4WxsdwAAAZfqvW8HAAAEAwBHMEUCIQDaWfgCubUbhaByk2pqcrK2
XXgGowC95yBDh6rzoWuIPAIgE9XqpVKEyXlrMSC8xRXpm7IrgvriH1/L31wF4au7
xSwAfQDAXSBUOFyyz7IXkg0vDceDUmFHsapP75fKeOHwu4T87QAAAZfqvXcDAAgA
AAUAQ5hEBAQDAEYwRAIgaZxpa6Dkrft8SqsEhOc8MvI2xrHyCfBp2H8yncnnqmEC
IGpEyQ6QdO8+n0Iq1l7CbirhvXngIxi+N/UkCWHqgIEoMAoGCCqGSM49BAMDA2gA
MGUCMHLjY3wCDlaLiNNzPpX5M8N31RPbsYyahimWbMMbgI84b3gZnRm5HWDJoWVx
C6Lr9AIxAKIDZkMk120ubUgPMW70WxTks3S8DQ1jwlRAMnBYVQaQQMft/4AVg5Af
rOUCBy5oEQ==
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIElzCCAn+gAwIBAgIQJtklZLQLsngwp0DD4clbajANBgkqhkiG9w0BAQsFADBm
MQswCQYDVQQGEwJVUzEzMDEGA1UEChMqKFNUQUdJTkcpIEludGVybmV0IFNlY3Vy
aXR5IFJlc2VhcmNoIEdyb3VwMSIwIAYDVQQDExkoU1RBR0lORykgUHJldGVuZCBQ
ZWFyIFgxMB4XDTI0MDMxMzAwMDAwMFoXDTI3MDMxMjIzNTk1OVowUzELMAkGA1UE
BhMCVVMxIDAeBgNVBAoTFyhTVEFHSU5HKSBMZXQncyBFbmNyeXB0MSIwIAYDVQQD
ExkoU1RBR0lORykgRmFsc2UgRmVubmVsIEU2MHYwEAYHKoZIzj0CAQYFK4EEACID
YgAE7mIshEAbfnZhXHmCLThagBq8wNKY84YkUynY83vBo8FGIFdBQ7xQV3NrPkhi
dMXyW4aQcADxF/skAnZAsvnjxR+oCnYZAtBXgeE+WFA6FE7/fr/ecbTglsAgp59e
ADZDo4IBADCB/TAOBgNVHQ8BAf8EBAMCAYYwHQYDVR0lBBYwFAYIKwYBBQUHAwIG
CCsGAQUFBwMBMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFKF0GgZtULeG
LUoswX60jYhJbM0WMB8GA1UdIwQYMBaAFLXzZfL+sAqSH/s8ffNEoKxjJcMUMDYG
CCsGAQUFBwEBBCowKDAmBggrBgEFBQcwAoYaaHR0cDovL3N0Zy14MS5pLmxlbmNy
Lm9yZy8wEwYDVR0gBAwwCjAIBgZngQwBAgEwKwYDVR0fBCQwIjAgoB6gHIYaaHR0
cDovL3N0Zy14MS5jLmxlbmNyLm9yZy8wDQYJKoZIhvcNAQELBQADggIBAFGjOrc+
GlZYCuxNKS9u+4l6pDux++Cg3FX3hR0QhCZPKORxnua9dJlles5NBcIf5W1Y2OW7
1El+oq+0cCS39bqfG3d+9sRbqnLlqB9xysRfpGPmY2IRQ4YFurIzurFw/TshoGGw
L74VtBgmxeO1fhP8OWJfnMB3EILdz6hxEqbQtCmU/2ejQTQEK6cQtBj33a+MUI7i
YnRP+OTL1M81tmZRkUWY7WItMGDPIabhXfHqvqYXh0huxqUDls0VjC52xpiK6e2F
+ZxouwmBwQlxSL9pJWMvhRGJdFCIBulQPm/0tbt2seBxkFKWIYmouDh+28swkTSl
f8mV0KGmEVmPka5CQkgSg4btNHUoZ1xwt++f4N12AapSfPDYVyJ69c9fw+kbFTFa
9G1keN75SIJovWWhy4XUEcGkInDM4GyyEff1kpeEeZaOQZe2UojnptfmqLf0qDj6
n02ABUdDiHhQT7Za634b0pxKAPXW2pSFflrGZc2e+pKpIG4ui/80uq8AGybeHda1
Dl7iS2Msv4wpBii4j1Qs8gXAb7yI9ozS2weCmu5oqDN4SnYZBYoirT8seUia62aw
XMVzkkQUsjRQz2oqQsTUZxtDuIU0VCNYPY0UgeSLjdzo+cUIbaoO6M8rAK42tq/1
jJ+0RltUFPHxLXxi0LIAV0tFJxEJVUbpv7Nt
-----END CERTIFICATE-----
```

Hasil pengujian menunjukkan bahwa IP SSL Let's Encrypt sudah terinstal. Meskipun organisasi penerbitnya adalah Let's Encrypt, tampaknya karena masih dalam tahap pengembangan dan menggunakan lingkungan staging, muncul peringatan pada hasilnya. Anda bisa membaca penjelasan lainnya dan contoh IP yang sudah berhasil diinstall SSL Let's Encrypt pada IPv6 https://focusnic.com/blog/letsencrypt-ssl-ip/
