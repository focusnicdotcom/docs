---
title: CGI
description: Cara Menggunakan CGI pada Apache di AlmaLinux 8
sidebar_position: 6
sidebar_label: CGI
---

Dalam dunia administrasi server Linux, penggunaan **CGI (Common Gateway Interface)** masih relevan terutama untuk sistem lama, skrip ringan, atau kebutuhan integrasi cepat tanpa framework tambahan. Panduan ini akan membahas secara **lengkap dan terstruktur** bagaimana **mengaktifkan dan menjalankan CGI di Apache Web Server pada AlmaLinux 8**, mulai dari instalasi hingga pengujian. Disertai dengan tips praktis untuk memastikan keamanan dan performa optimal pada server produksi.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security

## Mengaktifkan Module CGI
Sebelum melanjutkan, pastikan server sudah terinstal Apache HTTP Server dan memiliki akses root atau sudo. CGI membutuhkan modul tertentu yang harus diaktifkan agar bisa berjalan dengan baik. Jika Apache belum terinstall silahkan ikuti langkah-langkah berikut:

```
dnf update -y
dnf install httpd -y
systemctl enable --now httpd
```
Setelah itu, pastikan port 80 dan 443 (jika SSL digunakan) terbuka di firewalld:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Secara default, Apache di AlmaLinux 8 sudah ada modul CGI. Namun, modul ini harus dimuat secara manual agar file dengan ekstensi `.cgi` atau `.pl` dapat dijalankan. Verifikasi modul `mod_cgi` atau `mod_cgid` dengan perintah berikut:
```
httpd -M | grep cgi
```
Contoh output:
```
cgid_module (shared)
```
Jika output tidak keluar, kita dapat menambahkan konfigurasi di file virtual host atau konfigurasi utama:
```
nano /etc/httpd/conf.modules.d/01-cgi.conf
```
Sesuaikan parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.modules.d/01-cgi.conf"
<IfModule mpm_worker_module>
   LoadModule cgid_module modules/mod_cgid.so
</IfModule>
<IfModule mpm_event_module>
   LoadModule cgid_module modules/mod_cgid.so
</IfModule>
<IfModule mpm_prefork_module>
   LoadModule cgi_module modules/mod_cgi.so
</IfModule>
```
Kemudian restart Apache setelah melakukan perubahan:
```
apachectl configtest
systemctl restart httpd
```

### Menyiapkan Direktori untuk CGI Script di Apache
Direktori default untuk CGI adalah `/var/www/cgi-bin`, namun kita bebas menentukan direktori sendiri selama diatur dengan benar dalam konfigurasi. Berikut contoh konfigurasi virtualhost untuk CGI script:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Isi parameter berikut
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <Directory "/var/www/focusnic.biz.id/public_html/cgi-bin">
        AllowOverride All 
        Options +ExecCGI
        AddHandler cgi-script .cgi .pl
        Require all granted
    </Directory>

    ScriptAlias /cgi-bin/ "/var/www/focusnic.biz.id/public_html/cgi-bin/"
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Buat direktori dan berikan izin yang sesuai:
```
mkdir -p /var/www/focusnic.biz.id/public_html/cgi-bin
chown -R apache:apache /var/www/focusnic.biz.id
chmod +x /var/www/focusnic.biz.id/public_html/cgi-bin
```
Kemudian restart Apache untuk menyimpan perubahan
```
systemctl restart httpd
```
Kemudian buat skrip uji coba:
```
nano /var/www/focusnic.biz.id/public_html/cgi-bin/hello.cgi
```
Isi dengan skrip berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/cgi-bin/hello.cgi"
#!/bin/bash
echo "Content-type: text/html"
echo ""
echo "<html><body><h1>CGI Test Focusnic</h1></body></html>"
```

Sesuaikan permission:
```
chmod 755 /var/www/focusnic.biz.id/public_html/cgi-bin/hello.cgi
```

Apabila menggunakan SELinux silahkan izinkan permission berikut:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/cgi-bin/ -R
```

Buka di browser `http://$NAMA_DOMAIN/cgi-bin/hello.cgi`. Jika konfigurasi berhasil, Anda akan melihat halaman bertuliskan "CGI Focusnic Test"
![](/img/almalinux8-cgi.jpg)<br/>

Jika server digunakan dalam lingkungan produksi:

- **Aktifkan Logging Khusus** untuk skrip CGI.
- **Isolasi Proses** dengan menggunakan suEXEC atau mpm-itk (lebih lanjut bisa dikembangkan).
- **Gunakan HTTPS** agar transmisi data aman saat komunikasi dengan CGI script.
- **Audit Log Apache** untuk mendeteksi anomali dari skrip yang berjalan.

## Troubleshooting

1. Permission Denied<br/>
Pastikan file skrip memiliki permission eksekusi (chmod 755) dan pemiliknya adalah user apache dan juga SELinux:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/cgi-bin/ -R
```

2. Internal Server Error 500<br/>
Biasanya disebabkan karena kesalahan pada header output atau interpreter tidak ditemukan.

3. Script Not Executing, Just Downloaded<br/>
Pastikan direktori memiliki Options +ExecCGI dan AddHandler sudah ditambahkan.

4. ScriptAlias Tidak Ditemukan<br/>
Periksa kembali path `ScriptAlias` dan direktori yang dituju sudah benar serta eksis.


## Kesimpulan

**CGI** adalah teknologi yang masih digunakan untuk berbagai kebutuhan ringan dan integrasi sistem lama. Dengan konfigurasi yang benar di **Apache Web Server pada AlmaLinux 8**, CGI dapat berjalan dengan aman dan stabil. Dukungan terhadap skrip berbasis Bash atau Perl memberi fleksibilitas dalam pengembangan dan integrasi sistem.

Jika Anda mengelola server atau menginginkan solusi profesional untuk **instalasi server, CGI, Apache Web Server, ataupun cloud VPS**, **jangan ragu untuk menghubungi Focusnic** — **penyedia layanan VPS Linux dan Windows terbaik** dengan **lokasi global termasuk Singapura, German, US, dsb.**

Q: Apakah CGI masih relevan digunakan saat ini?<br/>
A: Masih, terutama untuk kebutuhan sistem lawas, skrip sederhana, atau proses integrasi yang tidak membutuhkan framework besar.

Q: Apakah CGI aman digunakan?<br/>
A: Aman selama dikonfigurasi dengan benar. Gunakan direktori khusus, batasi permission, dan aktifkan SELinux.

Q: Bagaimana mengecek apakah CGI sudah aktif di Apache?<br/>
A: Buat skrip sederhana seperti contoh hello.cgi dan akses via browser. Jika bisa dieksekusi, berarti sudah aktif.

Q: Apakah CGI hanya bisa digunakan dengan Perl?<br/>
A: Tidak. CGI adalah standar, dan bisa digunakan dengan Bash, Python, Ruby, dan bahasa lain selama ada interpreter-nya.

Q: Bagaimana cara mengisolasi skrip CGI di server shared hosting?<br/>
A: Gunakan `suEXEC` atau `mpm-itk` untuk membatasi user per proses.
