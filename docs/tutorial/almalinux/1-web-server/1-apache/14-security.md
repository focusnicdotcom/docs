---
title: Security
description: Konfigurasi Security di Apache Web Server AlmaLinux 8
sidebar_position: 14
sidebar_label: Security
---

Dalam upaya meningkatkan **keamanan situs web**, konfigurasi server tidak hanya sebatas menjalankan service, tetapi juga melibatkan penguatan pada level **transport layer**, **header HTTP**, hingga penghapusan informasi sensitif yang tidak perlu ditampilkan oleh web server. Artikel ini akan membahas secara menyeluruh mengenai **konfigurasi SSL**, **Hide Server Tokens**, **implementasi otentikasi dasar (basic authentication)**, serta pengaturan berbagai **HTTP Security Headers** seperti `Strict-Transport-Security`, `Content-Security-Policy`, `X-XSS-Protection`, `X-Frame-Options`, dan `X-Content-Type-Options` di **Apache Web Server pada sistem operasi AlmaLinux 8**.

## Prerequisite
- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)

## Install Apache

Selalu lakukan pembaruan sistem sebelum instalasi aplikasi server untuk memastikan kompatibilitas dengan repositori terbaru:
```
dnf update -y
```

Apabila belum menginstall Apache, silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```

Buka port HTTP dan HTTPS untuk Apache:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
## Virtualhost

Buat virtualhost sederhana, yang nantinya virtualhost ini akan digunakan untuk diimplementasikan hardening security:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Buat direktori berikut dan sesuaikan permission:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown apache:apache /var/www/focusnic.biz.id
```

Buat file testing sederhana
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```

Lalu restart Apache setelah melakukan perubahan pada virtualhost:
```
apachectl configtest
systemctl restart httpd
```

## Permission
Web Server Apache biasanya berjalan di bawah akun pengguna Apache default (atau akun non-privilege lainnya). Penting untuk memastikan bahwa Apache tidak berjalan di bawah akun istimewa, seperti `root`. Jika ya, akun tersebut harus diubah menjadi pengguna non-privilege untuk mencegah potensi risiko keamanan.

Verifikasi akun pengguna saat ini di mana Apache berjalan, output yang diharapkan adalah user `apache` yang menjalankan Apache web server. jalankan perintah berikut untuk mengecek:
```
[root@localhost ~]# ps -ef | grep httpd
root       18998       1  0 22:05 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND
apache     18999   18998  0 22:05 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND
apache     19000   18998  0 22:05 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND
apache     19001   18998  0 22:05 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND
apache     19002   18998  0 22:05 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND
apache     19214   18998  0 22:05 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND
```

Jika Apache berjalan di bawah akun `root` atau akun lain dengan hak istimewa yang lebih tinggi, ubah konfigurasinya agar berjalan di bawah akun tanpa hak istimewa seperti `apache`, `nobody`, `daemon`:
```
nano /etc/httpd/conf/httpd.conf
```

Pastikan parameter `User` dan `Group` adalah `apache`:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
...
...
..
User apache
Group apache
..
...
...
```

User `apache` tidak boleh memiliki hak istimewa `sudo`:
```
[root@localhost ~]#  sudo -l -U apache
User apache is not allowed to run sudo on localhost.
```

User `apache` tidak boleh memiliki akses ke shell login:
```
[root@localhost ~]# cat /etc/passwd | grep -i apache
apache:x:48:48:Apache:/usr/share/httpd:/sbin/nologin
```

Password untuk user `apache` harus dikunci:
```
[root@localhost ~]# passwd -S apache
apache LK 2025-07-06 -1 -1 -1 -1 (Password locked.)
```

Selain itu, file SSL seperti private key dan certificates harus diubah ke permission `root` dan mode `0600` atau `400` agar SSL tidak leak.

## SSL/TLS

Mengaktifkan **SSL (Secure Sockets Layer)** atau lebih tepatnya **TLS (Transport Layer Security)** pada server web seperti Apache memiliki **fungsi utama untuk mengamankan komunikasi antara pengguna (browser) dan server**, melalui **enkripsi data** yang dikirim dan diterima.

Agar Apache dapat menangani koneksi HTTPS, kita perlu menginstal modul SSL terlebih dahulu:
```
dnf install mod_ssl -y
```

### Self-Signed SSL

SSL Self-Signed cocok untuk lingkungan development atau internal server. Lalu, ikuti petunjuk yang muncul:
```
mkdir /etc/ssl/private
openssl req -nodes -newkey rsa:2048 -keyout /etc/ssl/private/private.key -out /etc/ssl/private/request.csr
```

Kemudian generate SSL certificate untuk 10 tahun:
```
openssl x509 -in /etc/ssl/private/request.csr \
-out /etc/ssl/private/certificate.crt \
-req -signkey /etc/ssl/private/private.key -days 3650
```

Lalu tambahkan SSL ke Virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter berikut:
```jsx {7-9} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SSLEngine on
    SSLCertificateFile /etc/ssl/private/certificate.crt
    SSLCertificateKeyFile /etc/ssl/private/private.key

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
### Let's Encrypt SSL

Let's Encrypt menyediakan sertifikat gratis dan valid secara publik. Gunakan Certbot untuk otomatisasi:
```
dnf install epel-release -y
dnf install certbot python3-certbot-apache -y
```

Pastikan virtualhost tetap default dan listen ke port `80`. Lalu jalankan perintah berikut untuk install SSL Let's Encrypt:
```
certbot --apache -d focusnic.biz.id
```

Certbot bisa melakukan renewal secara otomatis 30 hari sebelum SSL expired, untuk mengetesnya silahkan jalankan perintah berikut:
```
certbot renew --dry-run
```

## Server Tokens
Secara default, Apache menampilkan informasi tentang versi server yang bisa dimanfaatkan oleh pihak tidak bertanggung jawab.

Buka file konfigurasi utama Apache:
```
nano /etc/httpd/conf/httpd.conf
```
Tambahkan parameter berikut di bagian paling atas:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
ServerSignature Off
ServerTokens Prod
```
Kemudian restart Apache setelah melakukan perubahan konfigurasi:
```
apachectl configtest
systemctl restart httpd
```

Berikut adalah response header sebelum dilakukan perubahan:
```jsx {4}
[root@localhost ~]# curl -I http://localhost
HTTP/1.1 200 OK
Date: Fri, 18 Jul 2025 17:13:18 GMT
Server: Apache/2.4.37 (AlmaLinux) OpenSSL/1.1.1k
Last-Modified: Fri, 11 Jul 2025 14:56:11 GMT
ETag: "2b-639a882be8970"
Accept-Ranges: bytes
Content-Length: 43
Content-Type: text/html; charset=UTF-8
```

Berikut setelah melakukan perubahan pada `ServerSignature` dan `ServerTokens`:
```jsx {4}
[root@localhost ~]# curl -I http://localhost
HTTP/1.1 200 OK
Date: Fri, 18 Jul 2025 17:15:45 GMT
Server: Apache
Last-Modified: Fri, 11 Jul 2025 14:56:11 GMT
ETag: "2b-639a882be8970"
Accept-Ranges: bytes
Content-Length: 43
Content-Type: text/html; charset=UTF-8
```

Value yang didukung untuk parameter `ServerTokens`:

- `ServerTokens Full` → Mengembalikan informasi sebanyak mungkin, termasuk nomor versi untuk hal-hal seperti PHP atau modul tertentu. Hindari menyetel ServerTokens ke penuh!
- `ServerTokens Major` → Menempatkan versi mayor di header server, misalnya: Apache/
- `ServerTokens Minor` → Menempatkan versi mayor dan minor di header server, misalnya: Apache/2.4
- `ServerTokens Min` atau `ServerTokens Minimal` → Mengembalikan nomor versi Apache lengkap di header server, misalnya: Apache/2.4.37
- `ServerTokens OS` → mengembalikan nomor versi Apache lengkap dan nama OS, misalnya: Apache/2.4.37 (AlmaLinux) - yang ini sering kali menjadi default pada distribusi Linux populer karena mereka ingin mempromosikan merek mereka semaksimal mungkin.
- `ServerTokens Prod` atau `ServerTokens ProductOnly` → Hanya mengembalikan nama produk server `Apache` dan inilah yang paling direkomendasikan untuk digunakan.

Nilai untuk `ServerSignature` adalah:

- `ServerSignature On` → Menampilkan tanda tangan yang berisi nomor versi Apache.
- `ServerSignature Off` → Tidak menampilkan versi server di bagian bawah halaman kesalahan atau halaman daftar direktori.
- `ServerSignature EMail` → Menampilkan alamat email yang ditentukan dalam direktif `ServerAdmin`.

## HTTP/2
**HTTP/2** adalah versi terbaru dari protokol HTTP yang membawa berbagai peningkatan performa, antara lain:

- **Multiplexing**: Mengirim banyak permintaan sekaligus tanpa menunggu respons satu per satu.
- **Header compression (HPACK)**: Mengurangi overhead pengiriman header.
- **Prioritas dan server push**: Mempercepat waktu muat halaman.
- **Lebih cepat dan efisien dibanding HTTP/1.1**

:::info
HTTP/2 **hanya bisa digunakan lewat HTTPS (SSL)** di Apache, sehingga **aktivasi SSL adalah syarat mutlak** sebelum mengaktifkan HTTP/2.
:::

Apache HTTP/2 membutuhkan minimal Apache 2.4.17 dan `mod_http2`. AlmaLinux 8 biasanya sudah menyertakannya secara default. Verifikasi module:
```
httpd -M | grep http2
```

Contoh output:
```
proxy_http2_module (shared)
```

Aktifkan HTTP/2 pada virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```

Tambahkan parameter `Protocols h2 http/1.1` pada didalam baris `<VirtualHost>`:
```jsx {3} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Kemudian restart Apache setelah melakukan perubahan:
```
systemctl restart httpd
```

Verifikasi:
```
[root@localhost ~]# curl -I --http2 -k https://focusnic.biz.id
HTTP/2 200 
date: Sat, 19 Jul 2025 11:09:25 GMT
server: Apache
last-modified: Fri, 11 Jul 2025 14:56:11 GMT
etag: "2b-639a882be8970"
accept-ranges: bytes
content-length: 43
content-type: text/html; charset=UTF-8
```

Verifikasi juga dapat dilakukan melalui browser *Developer Tools*:
- Tekan F12 → Tab Network
- Tambahkan kolom `Protocol`, Anda akan melihat `h2` untuk koneksi HTTP/2

## HTTP Basic Authentication
**HTTP Basic Authentication** adalah metode otentikasi yang paling sederhana dan banyak digunakan untuk melindungi halaman web. Mekanismenya adalah:

- Klien (browser) mengirimkan **username dan password** yang dikodekan dalam format *Base64*.
- Apache memverifikasi kredensial tersebut dari file `.htpasswd`

Instal httpd-tools untuk membuat file password:
```
dnf install httpd-tools -y
```

Buat file password dan username untuk autentikasi:
```
htpasswd -c /etc/httpd/.htpasswd focusnic
```

Jika ingin menambah user lain silahkan gunakan perintah berikut tanpa parameter `-c`:
```
htpasswd /etc/.htpasswd focusnic-client
```

Kemudian sesuaikan permission dan file ini sebaiknya hanya bisa diakses oleh `root`:
```
chmod 640 /etc/httpd/.htpasswd
chown root:apache /etc/httpd/.htpasswd
```

Tambahkan parameter berikut di virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```

Tambahkan parameter berikut:
```jsx {12-17} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1

    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

    <Directory "/var/www/focusnic.biz.id/public_html">
        AuthType Basic
        AuthName "Restricted Content"
        AuthUserFile /etc/httpd/.htpasswd
        Require valid-user
    </Directory>

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```
Atau bisa juga menggunakan `.htaccess`
```
nano /var/www/focusnic.biz.id/public_html/.htaccess
```
Isi parameter berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/.htaccess"
AuthType Basic
AuthName "Admin Area"
AuthUserFile /etc/httpd/.htpasswd
Require valid-user
```
Kemudian restart Apache:
```
systemctl restart httpd
```

Lalu akses melalui browser `http://$DOMAIN`<br/>
![](/img/almalinux8-http-basic-auth.jpg)<br/>

Bisa juga menggunakan curl:
```
curl -u namauser:password https://focusnic.biz.id
```

## Whitelist IP Address

Untuk **melakukan whitelist IP di Apache Web Server** pada **AlmaLinux 8**, bisa menggunakan directive `Require ip` di dalam blok `<Directory>`, `<Location>`, atau langsung di dalam konfigurasi VirtualHost. Cara ini sangat efektif untuk membatasi akses hanya dari IP tertentu, baik untuk seluruh situs atau hanya sebagian direktori seperti `/admin`.

Whitelist IP untuk semua path di virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```

Isi parameter berikut
```jsx {11-15} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

    <Directory /var/www/focusnic.biz.id/public_html>
        Require all denied
        Require ip 192.168.2.4
        Require ip 192.168.1.20
    </Directory>

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Whitelist untuk direktori tertentu:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
    <Directory /var/www/focusnic.biz.id/public_html/wp-admin>
        Require all denied
        Require ip 192.168.2.4
        Require ip 192.168.1.20
    </Directory>
```

Whitelist IP Menggunakan `.htaccess`:
```
nano /var/www/focusnic.biz.id/public_html/.htaccess
```
Isi parameter berikut:
```
Require all denied
Require ip 192.168.2.4
Require ip 192.168.1.20
```
Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Untuk melakukan ujicoba silahkan akses domain melalui browser, apabila responsenya `403 (Forbidden)` maka whitelist IP sudah berhasil

## Security Headers

**Security Headers di Apache Web Server**, yang sangat penting untuk memperkuat keamanan aplikasi web Anda dan melindungi dari berbagai jenis serangan seperti XSS, clickjacking, dan MIME sniffing. Berikut adalah list lengkap Security Headers di Apache:

| **Security Header** | **Fungsi Utama** | **Contoh Konfigurasi di Apache** |
| --- | --- | --- |
| **Strict-Transport-Security** | Memaksa browser hanya menggunakan HTTPS, mencegah downgrade ke HTTP. | `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"` |
| **Content-Security-Policy** | Mencegah XSS dengan mengatur sumber daya (script, style, image, dll) yang diizinkan dijalankan. | `Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://apis.google.com"` |
| **X-XSS-Protection** | Mengaktifkan filter XSS pada browser modern. **(Legacy, kini tidak disarankan di browser modern)** | `Header set X-XSS-Protection "1; mode=block"` |
| **X-Frame-Options** | Mencegah website dibuka di dalam iframe (anti clickjacking). | `Header set X-Frame-Options "SAMEORIGIN"` |
| **X-Content-Type-Options** | Mencegah MIME sniffing, hanya memperbolehkan jenis konten sesuai deklarasi. | `Header set X-Content-Type-Options "nosniff"` |
| **Referrer-Policy** | Mengontrol data referer yang dikirim ke situs lain untuk menjaga privasi. | `Header set Referrer-Policy "no-referrer-when-downgrade"` |
| **Permissions-Policy** (dulu: `Feature-Policy`) | Mengontrol akses fitur browser seperti kamera, mikrofon, geolokasi dll dari halaman web. | `Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"` |
| **Cross-Origin-Embedder-Policy (COEP)** | Melindungi resource dari loading konten pihak ketiga tanpa izin eksplisit (berkaitan dengan isolasi resource web). | `Header set Cross-Origin-Embedder-Policy "require-corp"` |
| **Cross-Origin-Opener-Policy (COOP)** | Memastikan halaman memiliki konteks browsing yang terpisah (untuk keamanan isolasi proses). | `Header set Cross-Origin-Opener-Policy "same-origin"` |
| **Cross-Origin-Resource-Policy (CORP)** | Menentukan siapa yang boleh mengakses resource seperti gambar, font, dll dari domain lain. | `Header set Cross-Origin-Resource-Policy "same-origin"` |

Sebelum melakukan konfigurasi headers, pastikan module `mod_headers` sudah aktif:
```
httpd -M | grep headers
```

Contoh output:
```
headers_module (shared)
```

Lalu konfigurasi semua header yang ada di tabel diatas pada virtualhost berikut:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```
Tambahkan parameter berikut:
```jsx {11-22} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set Referrer-Policy "no-referrer-when-downgrade"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header set Cross-Origin-Opener-Policy "same-origin"
    Header set Cross-Origin-Resource-Policy "same-origin"
</IfModule>

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Lalu test pada situs berikut untuk mengecek security headers https://securityheaders.com/
![](/img/almalinux8-apache-security-headers.jpg)<br/>

Verifikasi menggunakan curl:
```jsx {5,10-18}
[root@localhost ~]# curl -I https://focusnic.biz.id
HTTP/2 200 
date: Sat, 19 Jul 2025 12:50:15 GMT
server: Apache
strict-transport-security: max-age=31536000; includeSubDomains; preload
last-modified: Fri, 11 Jul 2025 14:56:11 GMT
etag: "2b-639a882be8970"
accept-ranges: bytes
content-length: 43
content-security-policy: default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'
x-xss-protection: 1; mode=block
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: no-referrer-when-downgrade
permissions-policy: geolocation=(), microphone=(), camera=()
cross-origin-embedder-policy: require-corp
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
content-type: text/html; charset=UTF-8
```

### Rekomendasi Minimum untuk Situs Produksi

Untuk situs web biasa, berikut konfigurasi yang paling aman dan umum digunakan:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "no-referrer-when-downgrade"
Header set Content-Security-Policy "default-src 'self'"
```

## Options

Apache menggunakan directive `Options` dalam konfigurasi `Directory`, `VirtualHost`, atau `.htaccess` untuk mengatur bagaimana file dan direktori diakses dan dijalankan.

| **Parameter** | **Deskripsi** | **Rekomendasi Keamanan** |
| --- | --- | --- |
| `All` | Mengaktifkan semua opsi **kecuali** `MultiViews`. Sama dengan `Indexes FollowSymLinks Includes ExecCGI`. | Tidak direkomendasikan karena terlalu permisif. Gunakan opsi spesifik yang dibutuhkan. |
| `None` | Menonaktifkan semua fitur tambahan di direktori. | **Paling aman.** Digunakan jika tidak perlu fitur tambahan. |
| `Indexes` | Menampilkan **listing isi direktori** jika tidak ada file default (misalnya `index.html`). | **Nonaktifkan** jika tidak ingin pengunjung melihat struktur file (`Options -Indexes`). |
| `Includes` | Mengizinkan penggunaan **Server Side Includes (SSI)** di file `.shtml`. | Gunakan hati-hati, karena SSI bisa digunakan untuk menjalankan perintah sistem. |
| `IncludesNOEXEC` | Sama seperti `Includes` tetapi **tanpa kemampuan mengeksekusi skrip atau command eksternal**. | Lebih aman daripada `Includes`, gunakan jika hanya perlu include file statis. |
| `FollowSymLinks` | Mengizinkan Apache **mengikuti symbolic links**. | Gunakan **bersama** `SymLinksIfOwnerMatch` untuk keamanan. |
| `SymLinksIfOwnerMatch` | Apache hanya mengikuti symbolic links **jika pemilik link dan target file adalah sama**. | **Lebih aman** daripada `FollowSymLinks` biasa. Direkomendasikan untuk shared hosting. |
| `ExecCGI` | Mengaktifkan eksekusi file CGI (`.cgi`, `.pl`, `.py`, dll). | Hanya aktifkan pada direktori khusus dengan kontrol ketat. |
| `MultiViews` | Mengaktifkan content negotiation, memungkinkan Apache memilih file berdasarkan preferensi browser (seperti `index.en.html`, `index.fr.html`). | Gunakan jika mendukung multibahasa. Tidak berbahaya, tapi bisa menyebabkan kebingungan. |
| `RunScripts` | (Alias `ExecCGI`) Biasanya digunakan dalam konfigurasi yang lebih tua. | Tidak umum, gunakan `ExecCGI` langsung. |

Dalam **lingkungan produksi**, tidak semua opsi `Options` disarankan untuk diaktifkan, karena beberapa dapat menjadi **celah keamanan** atau menyebabkan **overhead yang tidak perlu**.

| **Parameter** | **Umum Digunakan?** | **Penjelasan** |
| --- | --- | --- |
| `FollowSymLinks` | ❌ Tidak | Jika symbolic link diarahkan ke file atau folder di luar root dokumen (misalnya ke file sistem atau konfigurasi penting), maka berpotensi membuka akses tak terkontrol ke sumber daya sensitif. |
| `-Indexes` | ✅ Sangat Disarankan | Menonaktifkan directory listing. Sangat penting agar file/folder tidak terlihat. |
| `None` | ✅ Ya | Menonaktifkan semua opsi, digunakan untuk keamanan maksimum. |
| `IncludesNOEXEC` | ⚠️ Kadang | Izinkan server-side includes **tanpa** kemampuan eksekusi script (lebih aman). |
| `ExecCGI` | ❌ Jarang | Hanya digunakan jika benar-benar butuh menjalankan CGI. Sebaiknya dihindari. |
| `MultiViews` | ❌ Jarang | Digunakan untuk content negotiation. Jarang perlu dalam setup standar. |
| `SymLinksIfOwnerMatch` | ✅ Alternatif Aman | Seperti `FollowSymLinks`, tapi hanya jika pemilik file sama (lebih aman). |

Berikut contoh virtualhostnya:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```

Isi parameter berikut:
```jsx {11-15} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf'
<IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

<Directory "/var/www/focusnic.biz.id/public_html">
    Options -Indexes -FollowSymLinks -ExecCGI
    AllowOverride All
    Require all granted
</Directory>

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

## UserDir

Fitur `UserDir` di Apache adalah salah satu modul yang memungkinkan pengguna sistem (user account di sistem Linux) untuk menyajikan file web mereka melalui URL berbasis nama user. Contoh mengakses website dengan `UserDir` yang aktif: `http://example.com/~example`. Secara default, Apache akan memetakan URL tersebut ke: `/home/username/public_html/`.


Pada **lingkungan produksi**, penggunaan `**UserDir**` di Apache **sangat jarang direkomendasikan**, bahkan **sering kali dinonaktifkan secara default**, karena alasan berikut:


1. **Risiko Keamanan Tinggi**: Setiap user di sistem bisa menyajikan konten web** melalui `~/public_html`, dan ini **membuka peluang kesalahan konfigurasi**, seperti:
- File pribadi yang tidak seharusnya dipublikasikan.
- Penggunaan `htaccess` yang tidak terkontrol.
- Potensi upload file berbahaya ke folder `public_html`.

2. **Tidak Sesuai dengan Standar Deployment Modern**:
- Platform modern seperti Laravel, Django, WordPress, dan Node.js **tidak bergantung pada struktur `UserDir`**.
- Biasanya web production memiliki struktur direktori khusus di `/var/www/` atau `/opt/web/`, bukan di home user.

3. **Sulit Dikelola dan Diaudit**. Banyaknya folder `~/public_html` yang aktif menyulitkan:
- Audit keamanan.
- Logging sentral.
- Manajemen file dan hak akses.


Untuk memblokir akses UserDir silahkan tambahkan parameter `LocationMatch` berikut pada virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```
Isi parameter berikut:
```jsx {11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

    <LocationMatch "^/~">
        Require all denied
    </LocationMatch>

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Jika tidak digunakan sama sekali, Anda bisa menonaktifkan modulnya:
```
rm -f /etc/httpd/conf.d/userdir.conf
```

Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

## HTTP Method
Untuk meningkatkan keamanan Apache Web Server di lingkungan produksi, kita disarankan untuk menonaktifkan metode HTTP yang tidak diperlukan.
| Metode HTTP | Umum Digunakan? | Keterangan |
| --- | --- | --- |
| GET | ✅ Ya | Untuk mendapatkan data dari server |
| POST | ✅ Ya | Untuk mengirim data ke server (form, API) |
| HEAD | ✅ Ya | Sama seperti GET tapi hanya header saja |
| OPTIONS | ⚠️ Kadang | Digunakan untuk preflight CORS, sebaiknya dibatasi |
| PUT | ❌ Tidak | Untuk mengganti/mengunggah sumber daya, jarang digunakan di website umum |
| DELETE | ❌ Tidak | Menghapus resource; rawan disalahgunakan |
| TRACE | ❌ Tidak | Untuk debugging, sering digunakan untuk eksploitasi (XST) |
| CONNECT | ❌ Tidak | Untuk tunneling proxy (biasanya HTTPS); tidak perlu diaktifkan di Apache |

Rekomendasi Produksi:
- Izinkan hanya: GET, POST, HEAD
- Tolak semua metode lain
- Gunakan firewall layer 7 (mod_security, CDN, atau WAF) untuk validasi lebih lanjut

Cara cek HTTP Method yang di aktifkan pada server, fokus pada parameter `allow`:
```jsx {5}
[root@localhost ~]# curl -i -k -X OPTIONS https://focusnic.biz.id
HTTP/2 200 
date: Sat, 19 Jul 2025 14:47:51 GMT
server: Apache
allow: GET,POST,OPTIONS,HEAD,TRACE
content-length: 0
content-type: text/html; charset=UTF-8
```

Matikan HTTP method `TRACE` pada semua virtualhost (global):
```
nano /etc/httpd/conf/httpd.conf
```
Isi parameter berikut pada bagian paling atas konfigurasi:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
TraceEnable Off
```
Kemudian limit `GET`, `POST`, dan `HEAD` pada virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```
Tambahkan parameter `LimitExcept`:
```jsx {14-16} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

    <Directory /var/www/focusnic.biz.id/public_html>
        Options -Indexes
        AllowOverride All
        <LimitExcept GET POST HEAD>
            Require all denied
        </LimitExcept>
    </Directory>

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

**Keuntungan:**

| Efek | Penjelasan |
| --- | --- |
| **Keamanan meningkat** | Menutup pintu bagi metode-metode berisiko tinggi seperti `PUT`, `DELETE`, dan `TRACE`, yang sering digunakan dalam eksploitasi. |
| **Perlindungan terhadap serangan XST dan HTTP Verb Tunneling** | Misalnya serangan menggunakan `TRACE` untuk mencuri cookie melalui cross-site tracing. |
| **Memperkecil permukaan serangan** | Membatasi interaksi hanya pada metode yang benar-benar dibutuhkan aplikasi. |
| **Kepatuhan terhadap standar keamanan** | Sesuai dengan rekomendasi OWASP dan audit keamanan server. |

**Hal yang Perlu Diwaspadai:**

| Potensi Masalah | Penjelasan |
| --- | --- |
| **Jika aplikasi Anda membutuhkan metode lain, bisa rusak** | Contoh: API RESTful kadang perlu `PUT` atau `DELETE`. Anda perlu membuka aksesnya khusus untuk endpoint tertentu. |
| **OPTIONS untuk preflight CORS akan diblokir** | Jika situs Anda mengaktifkan CORS dan `OPTIONS` diblokir, bisa terjadi error pada permintaan lintas domain. |


Verifikasi:
```
curl -X DELETE https://focusnic.biz.id
curl -X TRACE https://focusnic.biz.id
curl -v -X OPTIONS https://focusnic.biz.id
```

## Block Dotfiles

Untuk memblokir akses ke file sensitif di Apache Web Server, kita bisa menggunakan kombinasi direktif `<Files>`, `<FilesMatch>`, dan kontrol akses seperti `Require all denied` agar file tertentu tidak bisa diakses melalui URL, meskipun file tersebut secara fisik berada di dalam `DocumentRoot`. Cara ini merupakan bagian sangat penting dalam hardening server web di lingkungan produksi.

| Jenis File | Contoh | Alasan Pemblokiran |
| --- | --- | --- |
| File konfigurasi | `.env`, `.htaccess`, `config.php` | Menyimpan kredensial/database/config |
| File backup | `db.sql`, `site.zip`, `.tar.gz` | Bisa diunduh dan disalahgunakan |
| File dotfiles | `.git`, `.env`, `.bashrc` | Informasi internal yang tidak boleh terbuka |
| Kode sumber | `.phps`, `.bak`, `.old`, `.swp` | Bisa bocor struktur aplikasi |

Tambahkan parameter berikut untuk memblokir dotfiles dan file sensitif lainnya pada `<VirtaulHost>`:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Tambahkan parameter berikut:
```jsx {7-9} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <FilesMatch "\.(env|git|htaccess|log|bak|old|sql|tar\.gz|zip|swp|phps)$">
        Require all denied
    </FilesMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
