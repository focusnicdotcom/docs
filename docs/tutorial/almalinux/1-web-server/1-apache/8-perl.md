---
title: Perl
description: Cara Install dan Menggunakan Perl pada Apache di AlmaLinux 8
sidebar_position: 8
sidebar_label: Perl
---

Apache dan Perl adalah kombinasi yang sangat powerful dalam dunia server-side scripting. **Perl**, dengan fleksibilitas dan kekuatannya dalam memproses teks serta automasi server, menjadi bahasa yang tetap relevan hingga saat ini, terutama untuk aplikasi *legacy* maupun *scripting* sistem. Dalam panduan ini, kita akan membahas **langkah demi langkah instalasi Perl di web server Apache yang berjalan pada AlmaLinux 8**, sebuah distribusi Linux stabil dan kompatibel dengan Red Hat Enterprise Linux (RHEL). Panduan ini dirancang untuk **system administrator, webdev, dan penyedia layanan server** yang ingin memaksimalkan potensi server mereka menggunakan teknologi open-source.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security

## Instalasi Perl
Sebelum melakukan instalasi, pastikan sistem kita telah diperbarui ke versi terbaru untuk menghindari potensi konflik paket.
```
dnf update -y
```
Web server Apache adalah komponen utama dari lingkungan ini. Apabila belum menginstall Apache, jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```
Pastikan firewall mengizinkan trafik HTTP dan HTTPS:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
Secara default, Perl tersedia dalam repositori resmi AlmaLinux. Kita hanya perlu menjalankan satu perintah sederhana untuk menginstalnya:
```
dnf install perl -y
```
Setelah instalasi selesai, verifikasi versi Perl:
```
perl -v
```
Berikut contoh outputnya:
```
This is perl 5, version 26, subversion 3 (v5.26.3) built for x86_64-linux-thread-multi
```
Agar Apache dapat mengeksekusi skrip Perl, kita harus mengaktifkan `mod_cgi`. Pada AlmaLinux 8, modul ini tersedia di dalam paket Apache:
```
httpd -M | grep cgi
```
Contoh output:
```
cgid_module (shared)
```
Jika tidak muncul outputnya silahkan install paket berikut:
```
dnf install httpd-tools -y
```

## Menyiapkan Direktori untuk Perl Script di Apache

Buka file konfigurasi Apache (atau virtual host) yang relevan. Jika belum mempunyai virtual host, silahkan buat virtual host baru:
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

    <Directory "/var/www/focusnic.biz.id/public_html/perl-app">
        AllowOverride All
        Options +ExecCGI
        AddHandler cgi-script .cgi .pl
        Require all granted
    </Directory>

    ScriptAlias /perl-app/ "/var/www/focusnic.biz.id/public_html/perl-app/"
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Buat direktori:
```
mkdir -p /var/www/focusnic.biz.id/public_html/perl-app/
```
Selanjutnya adalah membuat skrip Perl sederhana:
```
nano /var/www/focusnic.biz.id/public_html/perl-app/hello.pl
```
Isi skrip berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/perl-app/hello.pl"
#!/usr/bin/perl
print "Content-type: text/html\n\n";
print "<html><head><title>Perl Apache</title></head><body><h1>Perl on Apache!</h1></body></html>";
```
Sesuaikan permission berikut:
```
chmod 755 /var/www/focusnic.biz.id/public_html/perl-app/hello.pl
```
Lalu, apabila menggunakan SELinux silahkan allow file execute berikut:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/perl-app/ -R
```
Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```
Buka di browser `http://$NAMA_DOMAIN/perl-app/hello.pl`<br/>
![](/img/almalinux8-perl.jpg)<br/>

## Troubleshooting
1. Internal Server Error (500) saat membuka skrip Perl <br/>

Pastikan file memiliki hak eksekusi:
```
chmod 755 /var/www/focusnic.biz.id/public_html/perl-app/hello.pl
```
Pastikan baris pertama file adalah:
```
#!/usr/bin/perl
```
Lalu cek juga SELinux, silahkan allow execute script:
```
chcon -t httpd_sys_script_exec_t /var/www/*/public_html/perl-app/ -R
```
Cek log error Apache:
```
tail -f /var/log/httpd/$NAMA_DOMAIN-error.log
```

2. File Perl tidak dijalankan, malah ditampilkan sebagai teks <br/>

Biasanya disebabkan oleh `mod_cgi` tidak aktif, atau parameter `AddHandler cgi-script .pl` belum ditambahkan. Silahkan aktifkan handler `.pl`
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
AddHandler cgi-script .pl .cgi
Options +ExecCGI
```

3. Forbidden atau 403 Access Denied <br/>

Biasanya disebabkan permission direktori/file terlalu ketat dan parameter `Require all granted` belum diatur. Silahkan tambahkan konfigurasi:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<Directory "/var/www/focusnic.biz.id/public_html/perl-app">
    Require all granted
</Directory>
```

4. perl command not found<br/>

Perl belum terinstal dengan benar. Silahkan install ulang Perl dengan perintah berikut:
```
dnf reinstall perl
```
Lalu verifikasi:
```
which perl
```

## Kesimpulan
Perl masih sangat relevan untuk penggunaan tertentu di dunia server, dan mengintegrasikannya dengan Apache memberikan fleksibilitas tinggi untuk automasi, monitoring, dan pemrosesan data dinamis berbasis web.

Jika Anda membutuhkan **bantuan profesional dalam instalasi server atau konfigurasi cloud hosting yang optimal**, segera kunjungi ***Focusnic***.

Q: Apakah Perl sudah terinstal secara default di AlmaLinux 8? <br/>
A: Tidak selalu. Beberapa versi minimal dari AlmaLinux 8 tidak menyertakan Perl, namun Anda dapat menginstalnya melalui `dnf`.

Q: Apakah saya bisa menggunakan ekstensi selain `.pl` untuk skrip Perl? <br/>
A: Bisa. Anda bisa menggunakan `.cgi` dan mengkonfigurasi Apache agar mengenal ekstensi tersebut menggunakan `AddHandler`.

Q: Apakah saya wajib menggunakan `mod_cgi`? <br/>
A: Ya, jika Anda ingin mengeksekusi skrip Perl via Apache. Modul ini bertugas menghubungkan request HTTP ke interpreter Perl.

Q: Bisakah saya menjalankan Perl di subdirektori tertentu saja? <br/>
A: Bisa. Gunakan konfigurasi `<Directory>` untuk membatasi eksekusi hanya di folder tertentu.

Q: Apakah aman menggunakan Perl di lingkungan produksi? <br/>
A: Aman, selama Anda menerapkan best practice seperti: membatasi hak akses, menghindari input tak divalidasi, dan memantau log secara berkala.

Q: Bagaimana jika saya ingin mengembangkan aplikasi web berbasis Perl seperti `CGI.pm` atau `Dancer`? <br/>
A: Instal modul tambahan menggunakan CPAN:
```
dnf install perl-CPAN -y
cpan Dancer
```
