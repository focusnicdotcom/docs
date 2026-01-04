---
title: Userdir
description: Cara Konfigurasi Userdir Apache di AlmaLinux 8
sidebar_position: 4
sidebar_label: Userdir
---

Dalam dunia administrasi sistem berbasis Linux, penggunaan direktori pengguna atau `Userdir` menjadi salah satu solusi yang sangat praktis untuk memberikan akses web pribadi kepada setiap pengguna sistem. Dengan mengaktifkan dan mengkonfigurasi modul `Userdir` di Apache Web Server pada sistem AlmaLinux 8, kita memungkinkan setiap pengguna untuk menyajikan halaman web mereka sendiri melalui URL seperti `http://server/~username` atau `http://IP_ADDRESS_SERVER/~username`. Panduan ini akan membahas konfigurasi `Userdir` secara mendalam, langkah demi langkah, lengkap dengan tips keamanan dan optimasi terbaik untuk performa server web Apache di AlmaLinux 8.

Modul `mod_userdir` merupakan bagian dari Apache HTTP Server yang memungkinkan direktori khusus pengguna di `~/public_html` dapat diakses melalui web. Fitur ini sangat populer di lingkungan edukasi dan pengembangan karena memungkinkan setiap user membuat dan mengelola web mereka sendiri tanpa harus memiliki akses root atau mengedit konfigurasi utama server.

## Prerequisite

- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security
- Setiap user telah memiliki direktori home di `/home/username`

## Konfigurasi Userdir
Jalankan perintah berikut untuk memastikan Apache sudah terinstall:
```
dnf install httpd -y
```
Aktifkan dan jalankan Apache:
```
systemctl enable --now httpd
```
Apabila menggunakan firewalld, pastikan firewall mengizinkan HTTP dan HTTPS:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Di AlmaLinux 8, modul `mod_userdir` sudah tersedia secara default. Namun, perlu dipastikan bahwa konfigurasinya telah benar. Buka file konfigurasi userdir.conf:
```
nano /etc/httpd/conf.d/userdir.conf
```
Pastikan isi file:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
<IfModule mod_userdir.c>
    UserDir enabled
    UserDir public_html
</IfModule>

<Directory "/home/*/public_html">
    AllowOverride FileInfo AuthConfig Limit Indexes
    Options MultiViews Indexes SymLinksIfOwnerMatch IncludesNoExec
    Require method GET POST OPTIONS
</Directory>
```
Atau pastikan dengan perintah berikut:
```
httpd -M |grep userdir
```
Berikut contoh outputnya:
```
userdir_module (shared)
```
Penjelasan singkat:

- `UserDir public_html` → Menentukan nama direktori yang digunakan dalam home user.
- `UserDir enabled user1 user2` → Hanya mengizinkan user yang disebutkan menggunakan Userdir.
- `<Directory "/home/*/public_html">` → Mengatur hak akses dan opsi yang diperbolehkan.

Setelah konfigurasi selesai, restart Apache:
```
apachectl configtest
systemctl restart httpd
```
Sebelum seorang pengguna dapat menggunakan direktori `Userdir`, tentu saja mereka harus memiliki akun di sistem. Kita dapat menambahkan user baru menggunakan perintah berikut:
```
adduser focusnic
passwd focusnic
```
Setiap user yang ingin menghosting situs melalui `Userdir` harus memiliki direktori `public_html` di dalam home-nya. Lakukan langkah berikut untuk masing-masing user:
```
mkdir /home/focusnic/public_html
chmod 711 /home/focusnic
chmod 755 /home/focusnic/public_html
chown -R focusnic:focusnic /home/focusnic/public_html
```
Letakkan file HTML atau situs web pengguna di dalam direktori `public_html`. Contoh:
```
echo "<h1>Halo dari Userdir</h1>" > /home/focusnic/public_html/index.html
```
Jika SELinux aktif, pastikan httpd memiliki izin untuk mengakses direktori home user:
```
setsebool -P httpd_enable_homedirs true
chcon -R -t httpd_user_content_t /home/focusnic/public_html
```
Akses melalui browser: `http://ip-server/~focusnic/`
![](/img/almalinux8-userdir.png)<br/>

### Userdir Production
Berikut adalah best practice (praktik terbaik) dalam implementasi `Userdir` pada lingkungan produksi di Apache Web Server AlmaLinux 8, agar tetap aman, stabil, dan terkelola dengan baik:

1. Batasi Pengguna yang Diizinkan Menggunakan `Userdir`<br/>

Konfigurasi default `UserDir enabled` akan mengizinkan semua user menyajikan konten web, yang berisiko besar di lingkungan produksi. Sebaiknya gunakan konfigurasi berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
<IfModule mod_userdir.c>
    UserDir disabled
    UserDir public_html
    Userdir enabled user_1 user_2 user_3
</IfModule>
```

2. Batasi Akses dan Opsi Direktori `public_html`<br/>

Gunakan konfigurasi minimalis dan aman untuk mencegah penyalahgunaan. Gunakan `AllowOverride All` hanya jika benar-benar dibutuhkan, karena `.htaccess` dapat menciptakan risiko keamanan dan memperlambat performa:
```
<Directory "/home/*/public_html">
    AllowOverride none
    Options -Indexes -ExecCGI -Includes
    Require all granted
</Directory>
```

3. Aktifkan SELinux HomeDir Access untuk Apache<br/>
```
setsebool -P httpd_enable_homedirs 1
chcon -R -t httpd_user_content_t /home/*/public_html
```
## Troubleshooting
1. Akses `http://server/~username` Menghasilkan Error 403 Forbidden<br/>

Permission direktori home atau public_html tidak benar atau SELinux menolak akses Apache ke home user. Solusi:
```
chmod 755 /home/username
chmod 755 /home/username/public_html
chcon -R -t httpd_user_content_t /home/username/public_html
setsebool -P httpd_enable_homedirs 1
```

2. Error 404 Not Found Saat Mengakses `http://server/~username`<br/>

File index.html tidak ada di dalam public_html, User tidak termasuk dalam daftar `UserDir enabled`, Apache belum di-restart setelah perubahan. Solusi:
```
echo "<h1>Halo dari Userdir</h1>" > /home/username/public_html/index.html
```
Tambahkan user ke konfigurasi `Userdir`:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
UserDir enabled username
```
Restart Apache:
```
systemctl restart httpd
```

3. Akses `Userdir` Berhasil, Tapi CSS/JS Tidak Dimuat<br/>

File tidak memiliki permission yang sesuai atau URL relative tidak sesuai. Solusi:
```
chmod 644 /home/username/public_html/*.css
chmod 644 /home/username/public_html/*.js
```

4. Tidak Bisa Eksekusi File PHP dalam `Userdir`<br/>

`mod_php` atau `php-fpm` belum dikonfigurasi untuk `public_html` atau Apache tidak mengizinkan eksekusi PHP di `Userdir`. Solusi:

- Tambahkan konfigurasi PHP di VirtualHost jika dibutuhkan
- Untuk keamanan, sebaiknya **tidak mengizinkan PHP di Userdir** di lingkungan produksi

5. Apache Tidak Menemukan Direktori `Userdir`<br/>

**Penyebab Umum:**

- Modul `mod_userdir` tidak aktif
- File `userdir.conf` tidak dimuat oleh Apache

**Solusi:**

- Pastikan file `/etc/httpd/conf.d/userdir.conf` ada
- Cek keberadaan modul dengan:
    ```    
    httpd -M | grep userdir
    ```
- Restart Apache:
    ```
    systemctl restart httpd
    ```

## Kesimpulan

Mengaktifkan dan mengkonfigurasi **Userdir pada Apache Web Server di AlmaLinux 8** adalah cara yang efisien untuk menyediakan layanan hosting web pribadi bagi setiap pengguna tanpa harus mengatur VirtualHost satu per satu. Dengan pendekatan ini, user dapat mengakses halaman mereka melalui `http://server/~username`.

Namun, konfigurasi ini perlu dilakukan secara hati-hati di lingkungan produksi dengan mempertimbangkan:

- Hak akses direktori yang benar
- Pengendalian siapa yang boleh menggunakan Userdir
- Pengamanan agar file script berbahaya tidak bisa dieksekusi
- Penyesuaian firewall dan SELinux

Jika konfigurasi dilakukan dengan baik, fitur ini sangat berguna dalam lingkungan edukasi, pengembangan internal, hingga kebutuhan shared web hosting.

**Bila Anda membutuhkan bantuan konfigurasi server profesional atau pengelolaan cloud VPS, jangan ragu untuk ke *Focusnic*** — mitra andalan Anda dalam membangun infrastruktur server yang aman dan optimal.

Q: Apa itu `Userdir` di Apache?<br/>
A: `Userdir` adalah fitur Apache yang memungkinkan user menyimpan halaman web mereka di dalam direktori `~/public_html`, yang bisa diakses via URL `http://server/~username`.

Q: Bagaimana cara mengaktifkan Userdir hanya untuk user tertentu?<br/>
A: Edit file /etc/httpd/conf.d/userdir.conf dan gunakan:
```jsx showLineNumbers title="/etc/httpd/conf.d/userdir.conf"
UserDir disabled
UserDir enabled user1 user2
```

Q: Kenapa saya mendapatkan error 403 saat mengakses `Userdir`?<br/>
A: Biasanya karena permission direktori tidak benar atau SELinux menolak akses. Gunakan perintah:
```
chmod 711 /home/username
chmod 755 /home/username/public_html
chcon -R -t httpd_user_content_t /home/username/public_html
```

Q: Apakah Userdir cocok digunakan di server produksi?<br/>
A: Bisa, asal dengan pengamanan ketat. Namun untuk skenario profesional atau komersial, penggunaan VirtualHost dan subdomain lebih disarankan untuk fleksibilitas dan keamanan lebih lanjut.

Q: Dapatkah saya mengaktifkan SSL (HTTPS) untuk `Userdir`?<br/>
A: Sertifikat SSL dari Let's Encrypt hanya berlaku untuk domain/subdomain, bukan path seperti `~username`. Untuk menggunakan SSL, pertimbangkan membuat subdomain (user.domain.com) dan mengarahkannya ke direktori user dengan VirtualHost.
