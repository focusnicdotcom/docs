---
title: Virtual Host
description: Cara Konfigurasi Virtual Host Apache di AlmaLinux 8
sidebar_position: 2
sidebar_label: Virtual Host
---
Apache HTTP Server adalah salah satu web server paling populer dan stabil yang banyak digunakan untuk menjalankan berbagai jenis website. Di lingkungan server berbasis AlmaLinux 8, penggunaan Virtual Host Apache menjadi solusi utama untuk meng-host beberapa situs web dalam satu server. Dokumentasi ini membahas secara komprehensif dan mendalam tentang cara mengatur Virtual Host di Apache Web Server pada sistem operasi AlmaLinux 8, mulai dari instalasi dasar hingga konfigurasi multi-domain.

Virtual Host memungkinkan kita untuk mengelola lebih dari satu website pada satu mesin server Apache. Hal ini sangat efisien untuk menghemat sumber daya, biaya server, serta memudahkan administrasi banyak domain dalam satu sistem.

Terdapat dua jenis Virtual Host dalam Apache:

- *Name-Based Virtual Host* → menggunakan alamat domain (hostname) untuk membedakan tiap situs.

- *IP-Based Virtual Host* → menggunakan alamat IP yang berbeda untuk tiap situs.

Di AlmaLinux 8, konfigurasi default menggunakan pendekatan *Name-Based* karena lebih hemat dan fleksibel.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security
- Domain Name (VALID FQDN)
## Konfigurasi Virtual Host
Sebelum memulai konfigurasi Virtual Host, pastikan sistem AlmaLinux 8 Anda telah terinstal Apache HTTP Server. Jika belum menginstall Apache, silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```
Pastikan firewall Anda mengizinkan HTTP dan HTTPS:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Konfigurasi Virtual Host sebaiknya dipisahkan dalam direktori khusus agar mudah dikelola:

- Direktori konfigurasi: `/etc/httpd/conf.d/$NAMA_DOMAIN.conf`
- Direktori dokumen situs: misalnya di `/var/www/$NAMA_DOMAIN/public_html/`

Struktur direktori yang disarankan:
```
/var/www/
├── focusnic.biz.id/
│   └── public_html/
├── domain2.com/
│   └── public_html/
```
Buat direktori dan berikan izin yang sesuai:
```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```

Buat file konfigurasi untuk domain:
:::info
Jika menggunakan lebih dari satu domain silahkan lakukan hal serupa untuk domain lainnya, misalnya domain2.com dan sesuaikan parameternya.
:::

```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi dengan konfigurasi berikut:
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
Setelah selesai, restart Apache:
```
apachectl configtest
systemctl restart httpd
```
Buat file `index.html` sederhana untuk menguji virtual host:
```
echo "<h1>Selamat Datang di focusnic.biz.id</h1>" > /var/www/focusnic.biz.id/public_html/index.html
```
Buka browser dan kunjungi `http://$NAMA_DOMAIN`. Jika konfigurasi benar, halaman akan ditampilkan sesuai file testing diatas.

### Virtual Host Production
Berikut adalah contoh konfigurasi Virtual Host Apache yang direkomendasikan untuk lingkungan production di AlmaLinux 8. Konfigurasi ini memperhatikan aspek keamanan, struktur log yang rapi, dukungan .htaccess, serta optimasi performa.

Untuk aplikasi yang memerlukan HTTP port 80:
```jsx showLineNumbers title="/etc/httpd/conf.d/$NAMA_DOMAIN.conf"
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com/public_html

    ErrorLog /var/www/example.com/logs/error.log
    CustomLog /var/www/example.com/logs/access.log combined

    # Blok file sensitif
    <FilesMatch "\.(user.ini|htaccess|git|svn|project|LICENSE|README\.md)$">
        Require all denied
    </FilesMatch>

    <Directory /var/www/example.com/public_html>
        Options +Includes +ExecCGI -Indexes -FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.html index.php
        
    # Kompresi output
        <IfModule mod_deflate.c>
            AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
        </IfModule>
    </Directory>
</VirtualHost>
```
Untuk aplikasi yang memerlukan HTTPS port 443:
```jsx showLineNumbers title="/etc/httpd/conf.d/$NAMA_DOMAIN.conf"
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com
    ServerAdmin admin@example.com
    DocumentRoot /var/www/example.com/public_html

    ErrorLog /var/www/example.com/logs/error.log
    CustomLog /var/www/example.com/logs/access.log combined

    # Sertifikat SSL 
    SSLEngine on
    SSLCertificateFile /etc/ssl/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/ssl/example.com/privkey.pem

    # Konfigurasi keamanan SSL tambahan (optional)
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5:!3DES
    SSLHonorCipherOrder on

    # Direktori publik website
    <Directory /var/www/example.com/public_html>
        Options +Includes +ExecCGI -Indexes -FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.html index.php

        <IfModule mod_deflate.c>
            AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
        </IfModule>
    </Directory>

    # Blok akses ke file sensitif
    <FilesMatch "\.(user.ini|htaccess|git|svn|project|LICENSE|README\.md)$">
        Require all denied
    </FilesMatch>

    # Header keamanan
    <IfModule mod_headers.c>
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>

    # Nonaktifkan metode TRACE
    TraceEnable off
</VirtualHost>
</IfModule>
```

Langkah-langkah sebelum mengaktifkan konfigurasi production berikut:
1. Apabila menggunakan SSL berbayar seperti Sectigo, DigiCert, dsb silahkan isi pada parameter SSL diatas. Namun, apabila menggunakan konfigurasi HTTP port 80 dan ingin menggunakan SSL Let's Encrypt silahkan jalankan perintah berikut:
```
dnf install certbot python3-certbot-apache -y
certbot --apache -d example.com
```
2. Direktori dan file log:
```
mkdir -p /var/www/example.com/public_html
mkdir -p /var/www/example.com/logs
chown -R apache:apache /var/www/example.com
```
3. Restart apache:
```
apachectl configtest
systemctl restart httpd
```

## Troubleshooting
Jika terjadi error saat menjalankan Virtual Host, berikut langkah pemecahan masalah:

Cek status Apache:
```
systemctl status httpd
```
Periksa error log Apache:
```
tail -f /var/log/httpd/$DOMAIN_NAME-error.log
```
atau log berikut jika menggunakan virtual host production:
```
tail -f /var/www/$DOMAIN_NAME/logs/error.log
```
Validasi konfigurasi Apache:
```
apachectl configtest
```
Periksa kepemilikan file dan izin folder. Gunakan `ls -la` untuk memastikan file dimiliki oleh user `apache` dan memiliki read permission.

## Kesimpulan

Konfigurasi Virtual Host Apache di AlmaLinux 8 adalah pondasi penting dalam pengelolaan multi-domain website di satu server. Dengan mengimplementasikan Virtual Host yang aman, rapi, dan terstruktur, kita bisa:

- Menjalankan banyak website pada satu instance Apache dengan efisien.

- Menyesuaikan pengaturan spesifik per domain, seperti direktori root, file log, kompresi, dan keamanan.

- Melindungi sistem dari celah umum seperti directory listing, akses file sensitif, dan kelemahan protokol HTTP lama.

- Meningkatkan performa dan skalabilitas dengan fitur kompresi, cache, dan .htaccess.

Dengan mengikuti praktik terbaik yang disajikan, server Apache Anda akan siap untuk operasional production secara aman dan profesional. Jika Anda membutuhkan bantuan teknis dalam setup server, konfigurasi Apache Virtual Host, atau layanan cloud VPS, jangan ragu untuk menghubungi Focusnic — mitra terpercaya dalam solusi infrastruktur digital modern.

Q: Apa itu Virtual Host di Apache?<br/>
A: Virtual Host memungkinkan Apache untuk menangani beberapa situs web (domain) dalam satu server fisik dengan konfigurasi yang berbeda.

Q: Apa perbedaan Name-Based dan IP-Based Virtual Host?<br/>
A: 
- Name-Based: Beberapa domain menggunakan satu IP address.

- IP-Based: Setiap domain memiliki alamat IP berbeda.

Q: Apakah saya bisa menggunakan .htaccess di Virtual Host?<br/>
A: Ya, pastikan konfigurasi Anda menyertakan: `AllowOverride All` di dalam blok `<Directory>` agar `.htaccess` berfungsi.

Q: Bagaimana cara mengaktifkan SSL/HTTPS di Virtual Host?<br/>
A: Gunakan Let’s Encrypt atau sertifikat SSL dari penyedia lain, lalu atur Virtual Host dengan direktif:
```jsx showLineNumbers title="/etc/httpd/conf.d/$NAMA_DOMAIN.conf"
SSLCertificateFile
SSLCertificateKeyFile
```

Q: Apa gunanya -Indexes dalam konfigurasi?<br/>
A: Options -Indexes mencegah Apache menampilkan daftar isi folder jika tidak ada file index.html, sehingga lebih aman dari eksplorasi direktori oleh pengunjung.

Q: Apakah perlu membuat file log per domain?<br/>
A: Sangat disarankan. Ini memudahkan Anda untuk: mendeteksi error per domain, melihat lalu lintas spesifik per situs, dan menyusun laporan analitik dengan akurat.

Q: Bagaimana jika konfigurasi saya tidak berjalan?<br/>
A: Cek syntax dengan `apachectl configtest` atau lihat error log

Q: Apakah konfigurasi ini bekerja di CentOS, Rocky Linux, atau RHEL?<br/>
A: Ya, karena AlmaLinux adalah *binary-compatible* dengan RHEL, maka konfigurasi Virtual Host ini juga *sepenuhnya kompatibel* di semua distro tersebut.
