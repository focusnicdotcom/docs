---
title: Install Apache
description: Cara Install Apache di AlmaLinux 8
sidebar_position: 2
sidebar_label: Install Apache / HTTPD
---
Apache Web Server masih menjadi pilihan utama untuk menyajikan konten website di lingkungan Linux. AlmaLinux 8, sebagai salah satu distribusi Linux enterprise yang stabil dan kompatibel dengan Red Hat Enterprise Linux (RHEL), menjadi pasangan yang ideal untuk instalasi Apache karena keandalannya, dukungan jangka panjang, dan ekosistemnya yang kuat. Dalam panduan ini, kita akan membahas langkah-langkah lengkap, detail, dan praktis untuk melakukan instalasi Apache Web Server pada sistem operasi AlmaLinux 8.

## Prerequisite
- Akses full `root`
- Basic Linux Command Line
- Security

## Instalasi Apache
Selalu lakukan pembaruan sistem sebelum instalasi aplikasi server untuk memastikan kompatibilitas dengan repositori terbaru:
```
dnf update -y
```
Apache dikenal dengan nama paket `httpd` di lingkungan Red Hat-based. Instalasi bisa dilakukan dengan perintah berikut:
```
dnf install httpd -y
```
Setelah instalasi selesai, aktifkan layanan Apache agar berjalan otomatis saat booting:
```
systemctl enable --now httpd
```
Untuk memastikan Apache telah berjalan dengan baik, gunakan perintah:
```
systemctl status httpd
```
Berikut contoh ouput status `httpd`:
```
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2025-07-11 18:34:56 WIB; 4s ago
     Docs: man:httpd.service(8)
 Main PID: 2027 (httpd)
   Status: "Started, listening on: port 80"
    Tasks: 213 (limit: 11143)
   Memory: 37.6M
```
Secara default, firewall di AlmaLinux 8 menggunakan Firewalld. Untuk membuka akses HTTP (port 80) dan HTTPS (port 443), jalankan perintah berikut:
```
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```
Buka browser dan akses alamat IP server, misalnya `http://192.168.1.100`, maka akan muncul halaman Apache Test Page
![](/img/almalinux8-httpd-test-page.jpg)<br/>

## Struktur Direktori Apache di AlmaLinux 8
Mengetahui struktur direktori Apache sangat penting untuk memudahkan manajemen konten dan konfigurasi:

- `/etc/httpd/` → Direktori utama konfigurasi Apache

- `/etc/httpd/conf/httpd.conf` → File konfigurasi utama

- `/etc/httpd/conf.d/` → Direktori konfigurasi tambahan, termasuk virtual host

- `/var/www/html/` → Direktori default tempat menyimpan file website

- `/var/log/httpd/` → Lokasi file log akses dan error Apache

## Menambahkan Konten Web Pertama
Letakkan file HTML ke dalam `/var/www/html/`. Contoh sederhana:
```
echo "<h1>Selamat Datang di Server Apache AlmaLinux 8</h1>" | tee /var/www/html/index.html
```
Setelah itu, akses server menggunakan browser untuk melihat halaman pertama Anda aktif.

## Troubleshooting
Menghadapi kendala saat menginstal atau menjalankan Apache adalah hal yang umum. Berikut adalah beberapa masalah yang sering muncul beserta solusi praktis yang bisa kita lakukan.
1. Apache gagal dijalankan dan menampilkan error saat menggunakan `systemctl start httpd`. Periksa status dan pesan error dengan:
```
systemctl status httpd
journalctl -xe
```
2. Jika port `80` atau `443` sudah digunakan oleh aplikasi lain, matikan atau konfigurasi ulang aplikasi tersebut.
```
lsof -i :80
lsof -i :443
```
3. Setelah mengedit file konfigurasi, perubahan tidak terlihat di browser. Pastikan file konfigurasi valid:
```
apachectl configtest
```
4. Restart Apache setelah perubahan:
```
systemctl restart httpd
```

## Kesimpulan
Proses **instalasi Apache Web Server di AlmaLinux 8** telah berhasil dilakukan dengan langkah-langkah yang tepat dan sistematis. Apache kini telah aktif dan berjalan sebagai **layanan penyaji konten web (HTTP)** di sistem, siap untuk digunakan sebagai fondasi utama dalam membangun dan mengelola aplikasi berbasis web.

Dengan konfigurasi dasar yang telah kita terapkan, server ini **sudah dapat menyajikan konten HTML statis**, serta memungkinkan pengguna mengakses halaman utama melalui alamat IP server. Ini merupakan tahap awal yang sangat penting sebelum kita melanjutkan ke tahap konfigurasi lanjutan seperti **pembuatan Virtual Host untuk mengelola banyak domain** dan **implementasi HTTPS dengan SSL untuk keamanan komunikasi**.

Langkah selanjutnya yang direkomendasikan adalah:

- Menyiapkan **Virtual Host** agar server dapat melayani banyak domain dalam satu server fisik atau VPS.
- Mengaktifkan **SSL (HTTPS)** menggunakan Let's Encrypt atau sertifikat lainnya untuk menjamin keamanan data pengguna.
- Mengoptimalkan performa dan melakukan hardening terhadap konfigurasi Apache untuk meningkatkan kecepatan, efisiensi, dan keamanan server.

Q: Apa itu Apache Web Server?<br/>
A: Apache adalah perangkat lunak open-source yang berfungsi untuk menyajikan konten website melalui protokol HTTP/HTTPS.

Q: Apakah AlmaLinux cocok untuk digunakan di lingkungan produksi?<br/>
A: Sangat cocok. AlmaLinux dirancang untuk menggantikan CentOS dengan stabilitas jangka panjang dan kompatibilitas RHEL 1:1.

Q: Bagaimana cara memastikan Apache tetap aman?<br/>
A: Lakukan update berkala, gunakan HTTPS, batasi akses dengan firewall, dan terapkan hardening konfigurasi.

Q: Apakah Focusnic bisa membantu instalasi dan konfigurasi Apache?<br/>
A: Ya, Focusnic adalah solusi terbaik untuk instalasi server dan pengelolaan cloud VPS profesional.
