\---
title: Webalizer
description: Cara Install dan Konfigurasi Webalizer di Apache Web Server AlmaLinux 8
sidebar_position: 4
sidebar_label: Webalizer
---

Dalam era digital yang semakin kompetitif, **monitoring lalu lintas website** adalah langkah penting untuk memahami perilaku pengunjung dan meningkatkan performa situs. Salah satu alat statistik web yang **ringan, cepat, dan efisien** adalah **Webalizer**. Panduan ini akan mengulas secara menyeluruh bagaimana **konfigurasi Webalizer di Apache Web Server AlmaLinux 8** dilakukan dari awal hingga dapat diakses secara publik, lengkap dengan **penyesuaian keamanan dan optimasi** untuk keperluan produksi.


**Webalizer** adalah aplikasi open-source yang digunakan untuk **menganalisis file access log suatu domain pada web server** dan menghasilkan laporan statistik dalam format HTML yang mudah dibaca. Webalizer banyak digunakan karena:

- Kinerja yang cepat
- Output grafik yang mudah dipahami
- Dukungan untuk berbagai jenis file log
- Integrasi mudah dengan Apache

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)
- Timezone sudah di konfigurasi

## Install Webalizer
Webalizer umumnya tersedia pada repositori EPEL. Silahkan jalankan perintah berikut untuk update server dan install EPEL:
```
dnf update -y
dnf install epel-release -y
```

Jalankan perintah berikut untuk menginstall paket Webalizer:
```
dnf install webalizer
```

Verifikasi instalasi:
```
webalizer -v
```

Contoh output:
```
Webalizer V2.23-08 (Linux 4.18.0-553.58.1.el8_10.x86_64 x86_64) English
Copyright 1997-2013 by Bradford L. Barrett
```

## Virtualhost untuk Webalizer

Ketika kita mengelola beberapa website dalam satu server menggunakan **Apache VirtualHost**, sangat ideal jika statistik **Webalizer dipisahkan** berdasarkan masing-masing domain. Ini memberikan visibilitas yang lebih jelas dan mendetail terhadap performa tiap website.

Pastikan Apache sudah terinstall, apabila belum silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```

Pastikan port HTTP dan HTTPS terbuka pada firewalld apabila menggunakannya:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Setiap VirtualHost harus memiliki file log sendiri. Contoh konfigurasi VirtualHost untuk `focusnic.biz.id`, Anda dapat menyesuaikan dengan domain yang sedang digunakan:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter default virtualhost dan juga parameter yang diperlukan untuk Webalizer:
```jsx {7,9-15} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    Alias /web-stats "/var/www/focusnic.biz.id/webalizer"

    <Directory "/var/www/focusnic.biz.id/webalizer">
        AuthType Basic
        AuthName "Webalizer Protected"
        AuthUserFile "/etc/httpd/.htpasswd-focusnic"
        Require valid-user
        AllowOverride None
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Buat user dan password `admin` untuk mengakses halaman Webalizer:
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

## Konfigurasi Webalizer

Salin file konfigurasi default Webalizer menjadi per-domain, dan sesuaikan dengan domain yang ingin di monitoring:
```
cp /etc/webalizer.conf /etc/webalizer.focusnic.biz.id.conf
```
Kemudian edit file Webalizer sesuai domain diatas:
```
nano /etc/webalizer.focusnic.biz.id.conf
```
Sesuaikan parameter berikut:
```jsx showLineNumbers title="/etc/webalizer.focusnic.biz.id.conf"
LogFile		/var/log/httpd/focusnic.biz.id-access.log
OutputDir	/var/www/focusnic.biz.id/webalizer
HistoryName	/var/lib/webalizer/focusnic.biz.id.hist
HostName        focusnic.biz.id
Incremental	yes
```

Lalu buat direktori untuk menyimpan log yang dihasilkan oleh Webalizer:
```
mkdir /var/www/focusnic.biz.id/webalizer
```

Jalankan perintah berikut untuk menghasilkan log dari Webalizer:
```
/usr/bin/webalizer -c /etc/webalizer.focusnic.biz.id.conf 
```

Kemudian akses `http://$NAMA_DOMAIN/web-stats` dan masukkan autentikasi username dan password yang telah dibuat sebelumnya:
![](/img/almalinux8-apache-webalizer.jpg)<br/>

### Otomatisasi Webalizer

Berbeda dengan AWStats yang memiliki skrip `awstats_updateall.pl` untuk memproses semua domain secara otomatis, Webalizer tidak memiliki skrip built-in serupa. Namun, kita bisa meniru konsep tersebut di Webalizer dengan membuat skrip shell sederhana untuk melakukan update otomatis pada semua domain/konfigurasi Webalizer yang kita punya.

```
nano /root/webalizer_updateall.sh
```
Isi skrip berikut:
```jsx showLineNumbers title="/root/webalizer_updateall.sh"
#!/bin/bash

CONFIG_DIR="/etc/webalizer"

for conf in "$CONFIG_DIR"*.conf; do
    echo "Running Webalizer for: $conf"
    /usr/bin/webalizer -c "$conf"
done
```
Berikan permission lalu test:
```
chmod +x /root/webalizer_updateall.sh
./webalizer_updateall.sh
```
Contoh output:
```
Running Webalizer for: /etc/webalizer.conf
Running Webalizer for: /etc/webalizer.focusnic.biz.id.conf
```

Kemudian buat cron untuk generate Webalizer setiap hari pada jam 00:00
```
crontab -e
```
Isi parameter berikut:
```
0 0 * * * /root/webalizer_updateall.sh
```

## Troubleshooting

1. Tidak Ada Statistik yang Ditampilkan <br/>

- Pastikan file log `access_log` tidak kosong
- Periksa apakah format log sesuai dengan yang dikenali Webalizer
- Cek izin baca file log oleh user Apache

2. Direktori `web-stats` Tidak Bisa Diakses <br/>

- Pastikan direktori `/web-stats` sudah dibuat dan diizinkan di VirtualHost
- Cek error log Apache untuk mengetahui penyebab

3. Statistik Tidak Terupdate Otomatis <br/>

Jalankan cron script secara manual untuk debugging:
```
./webalizer_updateall.sh
```

Cek apakah `Incremental yes` sudah diaktifkan di `.conf` Webalizer.

4. Statistik Tercampur Antar Domain <br/>

- Pastikan setiap domain memiliki file log dan konfigurasi `.conf` **yang benar-benar terpisah**.
- Jangan gunakan file log `access_log` global untuk semua domain jika ingin hasil statistik per VirtualHost.

## Kesimpulan

**Konfigurasi Webalizer di Apache Web Server AlmaLinux 8** merupakan solusi ringan untuk memonitor statistik website secara real-time tanpa ketergantungan layanan pihak ketiga. Dengan instalasi yang cepat dan penggunaan sumber daya yang minim, Webalizer tetap menjadi favorit banyak sysadmin untuk server mandiri. Kombinasi Apache dan Webalizer menjamin informasi lalu lintas web dapat dipantau secara efisien dan terukur.

Q: Apakah Webalizer bisa menampilkan statistik real-time? <br/>
A: **Tidak.** Webalizer menghasilkan laporan statis berbasis log. Pembaruan hanya terjadi saat Webalizer dijalankan ulang.

Q: Apakah Webalizer mendukung HTTPS? <br/>
A: **Ya.** Webalizer bekerja berdasarkan log Apache, jadi semua permintaan termasuk HTTPS akan tercatat di log yang kemudian diproses oleh Webalizer.

Q: Apa bedanya `Incremental yes` dan `no` di Webalizer? <br/>
A: 
- `yes`: hanya memproses baris log baru sejak terakhir dijalankan.
- `no`: memproses ulang semua log dari awal (lebih lambat dan boros resource).

Q: Apakah bisa digabungkan Webalizer dan AWStats dalam satu server? <br/>
A: **Bisa.** Selama mereka menggunakan file konfigurasi dan output direktori yang berbeda, tidak akan terjadi konflik.

Q: Apakah Webalizer bisa diakses tanpa login? <br/>
A: **Bisa**, tapi **tidak disarankan untuk produksi**. Sebaiknya gunakan autentikasi `htpasswd` untuk melindungi data statistik dari publik.

Q: Apakah Webalizer cocok untuk website dengan traffic besar? <br/>
A: Webalizer sangat cepat, namun tidak memiliki fleksibilitas analitik seperti Google Analytics atau Matomo. Untuk traffic besar, bisa digunakan sebagai **secondary analytics tools** yang ringan di sisi server.

Q: Bagaimana cara reset data statistik Webalizer? <br/>
A: Hapus isi direktori output dan file `webalizer.current`

```
rm -rf /var/www/focusnic.biz.id/webalizer/*
rm -f /var/lib/webalizer/webalizer.current
webalizer
```
