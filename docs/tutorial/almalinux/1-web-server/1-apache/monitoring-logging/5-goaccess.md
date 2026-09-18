---
title: GoAccess
description: Cara Install dan Konfigurasi GoAccess di Apache Web Server AlmaLinux 8
sidebar_position: 5
sidebar_label: GoAccess
---

Memantau trafik web server secara **real-time** menjadi kebutuhan utama dalam mengelola sistem produksi. Untuk itu, **GoAccess** hadir sebagai solusi analisis log untuk web server yang ringan namun sangat informatif. Pada panduan ini, kita akan membahas secara **mendalam, detail, dan sistematis** bagaimana melakukan **instalasi dan konfigurasi GoAccess di Apache Web Server berbasis AlmaLinux 8**, agar mampu memberikan visualisasi statistik yang akurat dan interaktif secara real-time.

**GoAccess** adalah aplikasi open-source berbasis terminal yang dirancang untuk memantau log web server secara langsung. Keunggulannya antara lain:

- Tampilan berbasis terminal yang interaktif.
- Mendukung output dalam format HTML real-time.
- Konsumsi resource rendah, sangat cocok untuk server produksi.
- Mendukung berbagai format log: **Apache, Nginx, AWS CloudFront, dan lain-lain.**

GoAccess sangat berguna dalam mengidentifikasi **trafik tertinggi, URL populer, status HTTP, user-agent, hingga negara asal pengunjung**, menjadikannya alat penting untuk sys admin dan devops.

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)
- Timezone sudah di konfigurasi

## Install GoAccess

Sebelum melakukan instalasi, sebaiknya update server dan juga menambahkan repisitory EPEL, karena GoAccess tidak tersedia di repositori default AlmaLinux:
```
dnf update -y
dnf install epel-release -y
```

Kemudian jalankan perintah berikut untuk menginstall GoAccess:
```
dnf install goaccess -y
```

Verifikasi instalasi GoAccess:
```
goaccess --version
```

Contoh output:
```
GoAccess - 1.8.1.
For more details visit: https://goaccess.io/
Copyright (C) 2009-2023 by Gerardo Orellana
```
## Virtualhost untuk GoAccess

:::info
Diasumsikan instalasi GoAccess akan diterapkan pada setiap domain atau virtualhost.
:::

Pastikan Apache sudah terinstall, apabila belum terinstall silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```

Pastikan port 80/443 sudah diizinkan apabila menggunakan firewalld jalankan perintah berikut:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Kemudian buat virtualhost berikut atau sesuaikan konfigurasinya:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter berikut:
```jsx {7,9-16}showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    Alias /web-stats "/var/www/focusnic.biz.id/goaccess"

    <Directory "/var/www/focusnic.biz.id/goaccess">
        AuthType Basic
        AuthName "GoAccess Protected"
        AuthUserFile "/etc/httpd/.htpasswd-focusnic"
        Require valid-user
        AllowOverride None
        DirectoryIndex index.html
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Buat user dan password `admin` untuk mengakses halaman GoAccess:
```
htpasswd -c /etc/httpd/.htpasswd admin
```
Kemudian buat direktori untuk virtualhost diatas:
```
mkdir -p /var/www/focusnic.biz.id/public_html
```
Lalu restart Apache setelah melakukan perubahan:
```
apachectl configtest
systemctl restart httpd
```

## Konfigurasi GoAccess

Secara default, Apache menggunakan log format Combined, yang terlihat seperti:
:::info
Pastikan log Anda berada di `/var/log/httpd/access_log`. Jika menggunakan VirtualHost, lokasi bisa bervariasi.
:::

```
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
```

Kemudian jalankan GoAccess mode terminal dengan perintah berikut:
```
goaccess /var/log/httpd/access_log --log-format=COMBINED --real-time-html
```
Berikut adalah contoh tampilannya
![](/img/almalinux8-apache-goaccess-term.jpg)<br/>

### Generate Static GoAccess

:::info
Pastikan sudah membuat virtualhost dan autentikasi user sesuai panduan diatas.
:::

Jalankan perintah berikut untuk membuat static report GoAccess dan direktorinya:
```
mkdir /var/www/focusnic.biz.id/goaccess
goaccess /var/log/httpd/focusnic.biz.id-access.log --log-format=COMBINED -o /var/www/focusnic.biz.id/goaccess/index.html
```
Berikut contoh outputnya:
```
 [PARSING /var/log/httpd/focusnic.biz.id-access.log] {7,280} @ {0/s}@ {0/s}
Cleaning up resources...
```

Kemudian akses melalui browser dengan mengetik `http://focusnic.biz.id/web-stats` pastikan user dan password sudah di konfigurasi.
![](/img/almalinux8-apache-goaccess-static.jpg)<br/>

Selain itu, Anda dapat mengunduh file yang ada di `/var/www/focusnic.biz.id/goaccess/index.html` dan menjalankan langsung pada komputer.

#### Otomatisasi Report GoAccess

Diasumsikan bahwa layout penyimpanan dan log seperti berikut:

- `/var/log/httpd/$DOMAIN-access.log` = access log untuk domain
- `/var/www/$DOMAIN/goaccess` = direktori untuk menyimpan hasil generate GoAccess

Buat skrip berikut:
```
nano /root/goaccess-daily-report.sh
```

Isi skrip berikut:
```jsx showLineNumbers title="/root/goaccess-daily-report.sh"
#!/bin/bash

# Directory source logs and destination of result GoAccess
LOG_DIR="/var/log/httpd"
WEB_DIR="/var/www"

# Find all logs ending -access.log
for logfile in "$LOG_DIR"/*-access.log; do
    # Get domain name file log
    filename=$(basename "$logfile")
    domain="${filename%-access.log}"

    # /goaccess is target stored logs GoAccess
    output_dir="$WEB_DIR/$domain/goaccess"
    output_file="$output_dir/index.html"

    # Create /goaccess if it's not presented
    mkdir -p "$output_dir"

    # Run GoAccess
    echo "Processing $domain ..."
    goaccess "$logfile" \
        --log-format=COMBINED \
        --output="$output_file"
done
```

Kemudian sesuaikan permission dan jalankan skrip:
```
chmod +x /root/goaccess-daily-report.sh
./goaccess-daily-report.sh
```
Contoh output:
```
Processing focusnic.biz.id ...
 [PARSING /var/log/httpd/focusnic.biz.id-access.log] {7,266} @ {0/s}@ {0/s}
Cleaning up resources...
```

Tambahkan ke Cron agar dijalankan setiap hari pada jam 00:00
```
crontab -e
```
Isi parameter berikut
```
0 0 * * * /root/goaccess-daily-report.sh
```
### Real-time GoAccess

:::info
Pastikan sudah membuat virtualhost dan autentikasi user sesuai panduan diatas.
:::

Jalankan perintah berikut untuk membuat real-time report GoAccess:
```
mkdir /var/www/focusnic.biz.id/goaccess
goaccess /var/log/httpd/focusnic.biz.id-access.log --log-format=COMBINED -o /var/www/focusnic.biz.id/goaccess/index.html --real-time-html --daemonize --port=7890 --ws-url=focusnic.biz.id
```

Buka port `7890` untuk websocket:
```
firewall-cmd --permanent --add-port=7890/tcp
firewall-cmd --reload
```
Kemudian akses melalui browser dengan mengetik `http://focusnic.biz.id/web-stats` pastikan user dan password sudah di konfigurasi.

:::danger
Karena WebSocket GoAccess tidak dilindungi secara default alias tidak memerlukan autentikasi. Sebaiknya gunakan report static agar lebih aman. Jika port `7890`  websocket terbuka ke publik:
1. **Siapa pun dapat membuka koneksi ke `ws://your-ip:7890`** dari browser atau tool seperti `wscat`, dan menerima data log Anda.
2. Informasi sensitif seperti:
    - IP pengunjung,
    - URL yang diakses,
    - Status HTTP,
    - Referrer,
    - User-Agent
:::
## Troubleshooting

1. Report Statistik GoAccess Tidak Muncul di Browser <br/>

**Kemungkinan penyebab:**

- Folder `/var/www/<domain>/goaccess/` belum dibuat.
- File `index.html` belum digenerate (cek cron/syntax skrip).
- Permissions tidak cukup (`chmod`, `chown`).

**Solusi:**

- Jalankan skrip secara manual untuk tes:
```
bash /root/goaccess-daily-report.sh
```
- Pastikan Apache dapat membaca folder tersebut:
```
chmod -R 755 /var/www/<domain>/goaccess
chown -R apache:apache /var/www/<domain>/goaccess
```

2. Log terlalu besar, GoAccess lambat atau gagal <br/>

**Kemungkinan penyebab:**

- File log sangat besar (beberapa ratus MB atau lebih).
- Resource server tidak cukup (RAM, CPU).

**Solusi:**

- Gunakan `logrotate` agar log harian dan lebih ringan.

3. Cron `goaccess-daily-report.sh` tidak berjalan

**Kemungkinan penyebab:**

- Cron tidak aktif atau tidak ada hak akses eksekusi.
- Skrip tidak diatur dengan `chmod +x`.

4. Skrip tidak menemukan file log baru setelah menambah domain <br/>

Format log file tidak sesuai pola `*-access.log`. Pastikan nama file log sesuai `/var/log/httpd/<domain>-access.log`.

5. Error Format Log <br/>

Jika GoAccess menampilkan error format, pastikan Anda menggunakan `--log-format=COMBINED` dan format di Apache Anda memang menggunakan combined. Periksa di `/etc/httpd/conf/httpd.conf`.

## Kesimpulan

Dengan menggunakan **GoAccess di Apache Web Server pada AlmaLinux 8**, kita dapat menyajikan statistik pengunjung secara **real-time, efisien, dan menarik secara visual**. Integrasi yang mudah dengan Apache menjadikannya pilihan ideal untuk administrator yang membutuhkan **monitoring log ringan namun powerful**. Baik dalam skala kecil maupun besar, GoAccess mampu membantu kita menganalisa pola trafik, mendeteksi anomali, serta menyusun strategi optimasi web server yang lebih baik.


Q: Apakah GoAccess mendukung sistem log selain Apache? <br/>
A: Ya, GoAccess juga mendukung Nginx, Amazon S3, AWS CloudFront, dan log format custom.

Q: Bisakah GoAccess digunakan tanpa output HTML? <br/>
A: Bisa. GoAccess dapat dijalankan murni dalam mode terminal untuk audit internal atau debugging cepat.

Q: Apakah GoAccess bisa dijalankan pada VPS dengan resource kecil? <br/>
A: Sangat bisa. GoAccess ringan dan tidak memakan banyak memori atau CPU, sangat cocok untuk server kecil.

Q: Apakah GoAccess menyimpan data statistik? <br/>
A: Tidak secara default. Jika ingin menyimpan data historis, Anda bisa menggunakan --persist atau integrasi dengan database eksternal.

Q: Apakah bisa menggunakan SSL di GoAccess? <br/>
A: Ya, Anda cukup menjadikan `/var/www/<domain>/goaccess` bagian dari VirtualHost HTTPS (:443) Anda, dan pastikan sertifikat SSL sudah dipasang.
