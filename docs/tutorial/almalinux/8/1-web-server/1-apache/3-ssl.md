---
title: SSL
description: Cara Install dan Konfigurasi SSL/TLS Apache di AlmaLinux 8
sidebar_position: 3
sidebar_label: SSL/TLS
---
Ketika membangun website yang aman dan andal, penggunaan SSL (Secure Socket Layer) adalah hal yang mutlak, terutama saat menggunakan Apache Web Server di sistem operasi AlmaLinux 8. Dalam panduan ini, kita akan membahas secara komprehensif dan teknis mengenai dua jenis sertifikat SSL: SSL Self-Signed dan SSL dari Let's Encrypt, serta bagaimana cara mengkonfigurasi keduanya secara lengkap dan praktis. Semua langkah yang dipaparkan berlaku secara langsung untuk Apache Web Server di AlmaLinux 8, dan disusun untuk memudahkan pengelolaan server secara mandiri maupun profesional.

## Kenapa SSL Penting?
SSL bukan hanya sekadar fitur keamanan. Google dan mesin pencari lainnya memberikan penilaian SEO yang lebih baik pada situs yang menggunakan HTTPS. Pengunjung pun lebih percaya dan merasa aman saat mengakses situs dengan ikon gembok hijau di browser mereka. Oleh karena itu, konfigurasi SSL adalah fondasi utama untuk keberhasilan situs modern, terlebih jika menggunakan Apache Web Server di AlmaLinux 8, sistem operasi yang populer di kalangan enterprise dan penyedia VPS.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security
- Virtual Host
- Domain Name (VALID FQDN)

## Konfigurasi SSL Self Signed
Pastikan Apache sudah terinstall. Jika belum silahkan jalankan perintah berikut untuk instalasi Apache:
```
dnf install httpd -y
systemctl enable --now httpd
```
Install module SSL dan OpenSSL:
```
dnf install mod_ssl openssl -y
```
Izinkan service HTTP dan HTTPS pada firewalld apabila menggunakannya:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
SSL Self-Signed cocok untuk lingkungan development atau internal server. Berikut langkah-langkahnya:
```
mkdir /etc/ssl/private
openssl req -nodes -newkey rsa:2048 -keyout /etc/ssl/private/private.key -out /etc/ssl/private/request.csr
```
Isikan informasi seperti Country, State, Organization, dan Common Name (domain):
```
writing new private key to '/etc/ssl/private/private.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:ID
State or Province Name (full name) []:YK
Locality Name (eg, city) [Default City]:YK
Organization Name (eg, company) [Default Company Ltd]:IT
Organizational Unit Name (eg, section) []:IT
Common Name (eg, your name or your server's hostname) []:localhost
Email Address []: [ENTER]

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []: [ENTER]
An optional company name []: [ENTER]
```
Kemudian generate SSL certificate untuk 10 tahun:
```
openssl x509 -in /etc/ssl/private/request.csr \
-out /etc/ssl/private/certificate.crt \
-req -signkey /etc/ssl/private/private.key -days 3650
```
Verifikasi:
```
ls -lah /etc/ssl/private/
```
Contoh output:
```
total 12K
drwxr-xr-x. 2 root root   67 Jul 12 17:04 .
drwxr-xr-x. 3 root root   34 Jul 12 17:02 ..
-rw-r--r--. 1 root root 1.2K Jul 12 17:04 certificate.crt
-rw-------. 1 root root 1.7K Jul 12 17:02 private.key
-rw-r--r--. 1 root root  980 Jul 12 17:03 request.csr
```
Edit atau buat file Virtual host konfigurasi baru:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:443>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

    SSLEngine on
    SSLCertificateFile /etc/ssl/private/certificate.crt
    SSLCertificateKeyFile /etc/ssl/private/private.key
</VirtualHost>
```
Buat direktori dan berikan izin yang sesuai:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```
Buat file `index.html` sederhana untuk menguji virtual host:
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```
Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Buka browser dan akses domain misalnya `https://focusnic.biz.id`
![](/img/almalinux8-ssl-self-signed.png)<br/>

## Konfigurasi SSL Let's Encrypt
:::info
Let's encrypt menyediakan SSL gratis per 3 bulan dan harus di renew. Jika Anda menginginkan SSL Certificate berbayar silahkan membeli dengan vendor seperti Sectigo, Digicert, dsb.
:::

Let's Encrypt menyediakan sertifikat gratis dan valid secara publik. Gunakan Certbot untuk otomatisasi:
```
dnf install epel-release -y
dnf install certbot python3-certbot-apache -y
```
Buat Virtual host:
```jsx showLineNumbers title="/etc/httpd.conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Buat direktori dan berikan izin yang sesuai:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```

Buat file `index.html` sederhana untuk menguji virtual host:
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```
Restart apache:
```
apachectl configtest
systemctl restart httpd
```
Sebelum menjalankan Certbot, pastikan DNS domain sudah mengarah ke IP server. Jalankan:
```
certbot --apache -d focusnic.biz.id
```
Ikuti instruksi yang diberikan dan isi data yang sesuai:
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Enter email address (used for urgent renewal and security notices)
 (Enter 'c' to cancel): admin@focusnic.biz.id

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.5-February-24-2025.pdf. You must
agree in order to register with the ACME server. Do you agree?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: Y

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing, once your first certificate is successfully issued, to
share your email address with the Electronic Frontier Foundation, a founding
partner of the Let's Encrypt project and the non-profit organization that
develops Certbot? We'd like to send you email about our work encrypting the web,
EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: No
Account registered.

Requesting a certificate for focusnic.biz.id

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
This certificate expires on 2025-10-10.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for focusnic.biz.id to /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
Congratulations! You have successfully enabled HTTPS on https://focusnic.biz.id

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
Verifikasi SSL:
```
certbot certificates
```
Contoh output:
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: focusnic.biz.id
    Serial Number: 69d31f4e4ec275357d4edc0f9309998cbc7
    Key Type: RSA
    Domains: focusnic.biz.id
    Expiry Date: 2025-10-10 09:31:50+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
Akses domain melalui browser, berikut contoh outputnya:
![](/img/almalinux8-ssl-letsencrypt.png)<br/>

Certbot bisa melakukan renewal secara otomatis 30 hari sebelum SSL expired, untuk mengetesnya silahkan jalankan perintah berikut:
```
certbot renew --dry-run
```
Berikut contoh outputnya:
```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/focusnic.biz.id.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Account registered.
Simulating renewal of an existing certificate for focusnic.biz.id

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all simulated renewals succeeded: 
  /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
## Troubleshooting
1. Port `443` tidak terbuka. Pastikan port `443` terbuka di firewall:
```
firewall-cmd --add-service=https --permanent
firewall-cmd --reload
```
2. Error sertifikat tidak valid. Untuk SSL Self-Signed, browser memang menandainya tidak valid. Untuk Let's Encrypt, pastikan DNS domain valid dan terbuka dari publik.
3. Apache tidak bisa di restart. Cek konfigurasi Apache:
```
apachectl configtest
```

## Kesimpulan
Konfigurasi SSL pada **Apache Web Server di AlmaLinux 8** sangat penting untuk memastikan keamanan data antara pengguna dan server, serta memberikan kepercayaan kepada pengunjung situs. Terdapat dua metode utama dalam pemasangan SSL:

1. **SSL Self-Signed**
    - Cocok untuk testing, development, dan jaringan internal.
    - Dibuat manual menggunakan OpenSSL.
    - Tidak dipercaya oleh browser publik karena bukan dari Otoritas Sertifikat (CA).
2. **SSL Let's Encrypt**
    - Cocok untuk produksi dan website publik.
    - Gratis, valid secara global, dan otomatis diperpanjang.
    - Menggunakan *Certbot* untuk instalasi dan perpanjangan otomatis.

Selain itu, telah dibahas juga cara membuka port, mengatur firewall, melakukan redirect dari HTTP ke HTTPS, serta mengaktifkan HSTS untuk meningkatkan keamanan.

Jika Anda memerlukan bantuan profesional dalam instalasi server dan cloud VPS, jangan ragu untuk ke ***Focusnic*** sebagai solusi andal dan terpercaya.
| Fitur | SSL Self-Signed | SSL Let's Encrypt |
| --- | --- | --- |
| Validitas Browser | Tidak dipercaya (not secure) | Dipercaya oleh semua browser |
| Biaya | Gratis | Gratis |
| Otomatisasi | Manual | Otomatis dengan Certbot |
| Ideal Untuk | Testing, Internal Server | Produksi, Website Publik |
| Masa Berlaku | Bebas ditentukan | 90 hari (dapat diperpanjang) |

Q: Apa itu SSL Self-Signed dan kapan sebaiknya digunakan?
A: SSL Self-Signed adalah sertifikat yang ditandatangani sendiri oleh pemilik server. Cocok digunakan pada lingkungan internal, pengujian, atau pengembangan, karena tidak dikenali oleh browser umum.

Q: Apakah SSL Self-Signed aman?
A: Secara enkripsi, SSL Self-Signed sama amannya dengan SSL dari CA resmi, namun tidak dapat dipercaya oleh browser, sehingga biasanya memunculkan peringatan “Your connection is not private”.

Q: Apa keunggulan SSL dari Let's Encrypt dibandingkan SSL Self-Signed?
A: Dipercaya oleh semua browser, diperbarui otomatis, gratis, dan ideal untuk website produksi dan publik.

Q: Bagaimana cara memperbarui sertifikat Let's Encrypt secara otomatis?
A: Let's Encrypt menggunakan Certbot, dan sudah dijadwalkan untuk memperbarui otomatis melalui sistem systemd timer. Bisa dicek dengan: `certbot renew --dry-run`

Q: Apakah AlmaLinux 8 kompatibel dengan SSL dan Let's Encrypt?
A: Ya, AlmaLinux 8 sangat kompatibel dengan semua jenis SSL, termasuk Let's Encrypt. Sertifikasi dan sistem keamanannya setara dengan distribusi enterprise lain seperti RHEL dan CentOS.

Q: Apakah saya perlu membuka port tertentu untuk SSL bekerja?
A: Ya, Anda perlu membuka port:

- **80/tcp** untuk HTTP
- **443/tcp** untuk HTTPS

Q: Apakah saya bisa menggunakan wildcard SSL dengan Let's Encrypt?<br/>
A: Bisa, namun membutuhkan verifikasi DNS dan tidak dapat menggunakan metode HTTP biasa. Cocok jika Anda menggunakan banyak subdomain.

Q: Apakah sertifikat SSL Let's Encrypt berlaku selamanya?<br/>
A: Tidak. Masa berlaku setiap sertifikat hanya 90 hari, namun dapat diperpanjang secara otomatis menggunakan Certbot.

Q: Apakah saya bisa menggunakan kedua jenis SSL secara bersamaan?<br/>
A: Tidak direkomendasikan. Gunakan SSL Let's Encrypt untuk lingkungan publik, dan SSL Self-Signed untuk kebutuhan internal atau development saja.


