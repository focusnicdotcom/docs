---
title: Java
description: Cara Install dan Menggunakan Java pada Apache di AlmaLinux 8
sidebar_position: 9
sidebar_label: Java
---

Dalam ekosistem server modern, **Java** masih menjadi salah satu platform paling andal untuk menjalankan berbagai aplikasi web dan enterprise. Salah satu kombinasi yang sering digunakan adalah **Java dengan Apache Web Server di AlmaLinux 8**, sistem operasi berbasis RHEL yang stabil dan diandalkan oleh banyak sys admin. Panduan ini akan membahas secara **mendalam, sistematis, dan terstruktur** bagaimana kita dapat melakukan **instalasi Java** serta mengintegrasikannya dengan **Apache Web Server** di **AlmaLinux 8** untuk mendukung berbagai kebutuhan aplikasi berbasis Java.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security

## Instalasi Java
Ada beberapa distribusi Java yang bisa kita gunakan, seperti:
- **OpenJDK (gratis dan open-source)**
- **Oracle JDK (proprietary dengan lisensi khusus)**

Pada panduan ini kita akan menggunakan OpenJDK 17, versi yang paling stabil dan populer saat ini untuk pengembangan dan produksi. AlmaLinux 8 biasanya sudah memiliki paket OpenJDK di repositori default. Namun untuk memastikan silahkan jalankan perintah berikut:
```
dnf search openjdk
```

Install OpenJDK 17:
```
dnf install java-17-openjdk java-17-openjdk-devel -y
```

Verifikasi instalasi Java:
```
java -version
javac -version
```

Contoh output:
```
openjdk version "1.8.0_452"
OpenJDK Runtime Environment (build 1.8.0_452-b09)
OpenJDK 64-Bit Server VM (build 25.452-b09, mixed mode)

javac 17.0.15
```

Jika sebelumnya telah terinstal versi Java lain, kita perlu memastikan Java 17 menjadi default dengan:
```
alternatives --config java
```
Contoh output. Pilih Java 17 dari daftar yang tersedia:
```
There are 2 programs which provide 'java'.

  Selection    Command
-----------------------------------------------
*+ 1           java-1.8.0-openjdk.x86_64 (/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.452.b09-2.el8.x86_64/jre/bin/java)
   2           java-17-openjdk.x86_64 (/usr/lib/jvm/java-17-openjdk-17.0.15.0.6-2.el8.x86_64/bin/java)

Enter to keep the current selection[+], or type selection number: 2
```
Kemudian verifikasi:
```
java --version
```
Contoh output:
```
openjdk 17.0.15 2025-04-15 LTS
OpenJDK Runtime Environment (Red_Hat-17.0.15.0.6-1) (build 17.0.15+6-LTS)
OpenJDK 64-Bit Server VM (Red_Hat-17.0.15.0.6-1) (build 17.0.15+6-LTS, mixed mode, sharing)
```

### Mengatur JAVA_HOME Environment
Menambahkan variabel JAVA_HOME sangat penting untuk menjalankan banyak aplikasi berbasis Java.

Cek path instalasi Java:
```
readlink -f $(which java)
```
Contoh output:
```
/usr/lib/jvm/java-17-openjdk-17.0.15.0.6-2.el8.x86_64/bin/java
```
Tambahkan JAVA_HOME ke environment:
```
nano ~/.bash_profile
```
Isi parameter berikut pada bagian paling bawah:
```
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-17.0.15.0.6-2.el8.x86_64/bin/java
export PATH=$JAVA_HOME/bin:$PATH
```
Simpan dan reload profile:
```
source ~/.bash_profile
```

## Virtual Host Java di Apache

Apache Web Server adalah salah satu HTTP server paling banyak digunakan. Pastikan sudah terintall di server, apabila belum terinstall silahkan jalankan perintah berikut untuk menginstall di AlmaLinux 8:
```
dnf install httpd -y
systemctl enable --now httpd
```

Pastikan port 80 (dan 443 jika menggunakan SSL) terbuka pada firewalld:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Install Tomcat sebagai server aplikasi Java dan wadah servlet:
```
dnf install tomcat -y
systemctl enable --now tomcat
```

Kemudian buat virtualhost dengan mode reverse proxy mengarah ke tomcat
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
 
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:8080/app1/
    ProxyPassReverse / http://localhost:8080/app1/

    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Keterangan singkat parameter diatas:

- `ProxyPreserveHost On` → Menginstruksikan Apache untuk meneruskan header `Host:` asli dari klien saat melakukan proxy ke backend `http://localhost:8080/app1/`
- `ProxyRequests Off` → Memastikan bahwa Apache tidak bertindak sebagai forward proxy umum (open proxy). Kita hanya ingin Apache menjadi reverse proxy untuk Tomcat.
- `ProxyPass` → Meneruskan semua permintaan dari root URL `/` ke `http://localhost:8080/app1/`. Jadi, jika user mengakses `http://focusnic.biz.id/page.jsp`, Apache akan mengambil kontennya dari `http://localhost:8080/app1/page.jsp`.

Apabila menggunakan SELinux silahkan allow http connect:
```
setsebool -P httpd_can_network_connect 1
chcon -Rt tomcat_var_lib_t /var/lib/tomcat/webapps/
ls -Z /var/lib/tomcat/webapps
```

Kemudian restart Apache untuk menyimpan konfigurasi diatas:
```
systemctl restart httpd
```

### Menyiapkan Direktori untuk Aplikasi Java
Aplikasi Java akan di proses oleh Tomcat, dan HTTP/Apache hanya bertindak sebagai reverse. Sebagai gantinya kita harus membuat file pada direktori web root Tomcat. Defaultnya ada di `/var/lib/tomcat/webapps`. Jalankan perintah berikut untuk membuat direktori baru pada setiap project/domain:

```
mkdir /var/lib/tomcat/webapps/app1
cd /var/lib/tomcat/webapps/app1
nano hello.jsp
```

Isi skrip sederhana berikut:
```jsx showLineNumbers title="/var/lib/tomcat/webapps/app1/hello.jsp"
<%@ page language="java" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.text.SimpleDateFormat" %>
<html>
  <body>
    <h1>Java JSP on Apache!</h1>

    <h2>Server Time:</h2>
    <%
        // Get current server time
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        String currentTime = formatter.format(new Date());
        out.println("<p>" + currentTime + "</p>");

        // Get Kernel
        String osName = System.getProperty("os.name");
        String osVersion = System.getProperty("os.version");
        String javaVersion = System.getProperty("java.version");
    %>

    <h2>System Info: </h2>
    <p>OS Name: <%= osName %></p>
    <p>Ver: <%= osVersion %></p>
    <p>Ver Java: <%= javaVersion %></p>
  </body>
</html>
```

Lalu sesuaikan permisision:
```
chown root:tomcat hello.jsp
```

Silahkan akses domain `http://$NAMA_DOMAIN/hello.jsp`<br/>
![](/img/almalinux8-java-jsp.jpg)<br/>

## Troubleshooting

1. Permission denied, Error AH00957<br/>

Berikut pesan error lengkapnya:
```
(13)Permission denied: AH00957: HTTP: attempt to connect to 127.0.0.1:8080 failed
```
Solusinya adalah mengizinkan Apache (httpd) melakukan koneksi jaringan keluar ke Tomcat di port 8080 jika SELinux aktif:
```
setsebool -P httpd_can_network_connect 1
```

2. 404 Not Found<br/>

File `.jsp` sudah ada, tapi saat diakses dari browser muncul `404 Not Found`. Pastikan file .jsp benar-benar ada di `/var/lib/tomcat/webapps/app1/`. Lalu seuaikan permission ke user `tomcat` dengan perintah berikut
```
chown -R tomcat:tomcat /var/lib/tomcat/webapps/app1
```

3. Apache Menampilkan Halaman Default, Bukan JSP <br/>

Browser hanya menampilkan halaman default Apache, bukan aplikasi Java Anda. Cek apakah `ProxyPass` sudah sesuai:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
ProxyPass / http://localhost:8080/app1/
ProxyPassReverse / http://localhost:8080/app1/
```

Akses JSP dengan URL `http://focusnic.biz.id/hello.jsp`

4. Aplikasi JSP Hanya Bisa Diakses Jika setenforce 0 pada SELinux<br/>

Saat SELinux aktif (Enforcing), aplikasi Java tidak bisa diakses. Saat setenforce 0, bisa. Jalankan perintah berikut:
```
restorecon -Rv /var/lib/tomcat/
```
Pastikan file memiliki label SELinux `tomcat_var_lib_t`:
```
ls -Z /var/lib/tomcat/webapps/app1/
```

5.  Tomcat Tidak Men-deploy Folder Aplikasi <br/>

Folder `app1` ada tapi tidak aktif di Tomcat. Solusi:
- Pastikan folder `app1` tidak kosong dan memiliki minimal satu file `.jsp`.
- Pastikan tidak ada masalah hak akses (harus dimiliki oleh user `tomcat`).

## Kesimpulan

Instalasi Java di Apache Web Server dengan reverse proxy ke Tomcat pada AlmaLinux 8 adalah solusi efisien dan modular untuk meng-host aplikasi Java berbasis JSP/Servlet. Proses ini menggabungkan kekuatan **Apache sebagai reverse proxy** dengan performa **Tomcat sebagai Java container**.

Hal-hal penting yang perlu dipastikan:

- **Modul Apache proxy** (`mod_proxy`, `mod_proxy_http`, atau `mod_proxy_ajp`) telah diaktifkan.
- **SELinux diatur dengan benar** agar Apache dapat mengakses backend Tomcat.
- **Folder aplikasi Java memiliki hak akses dan konteks SELinux yang sesuai**.
- Konfigurasi `ProxyPass` dan `ProxyPassReverse` disesuaikan dengan struktur path aplikasi.

Dengan konfigurasi yang benar, integrasi ini memungkinkan deployment yang scalable, aman, dan fleksibel untuk berbagai kebutuhan aplikasi Java web.

Q: Apakah saya masih perlu `mod_jk` jika sudah menggunakan `mod_proxy`? <br/>
A: `mod_proxy` sudah cukup untuk meneruskan permintaan ke Tomcat, baik melalui HTTP `mod_proxy_http` atau AJP `mod_proxy_ajp`. Anda tidak perlu file `workers.properties` jika sudah pakai `mod_proxy`.

Q: Bisakah saya host lebih dari satu aplikasi Java di satu server Apache-Tomcat?<br/>
A: Gunakan VirtualHost berbeda untuk setiap domain, dan arahkan ke context yang berbeda di Tomcat (/app1, /app2, dll.). Contoh:
```
ProxyPass / http://localhost:8080/app1/
```

Q: Kenapa file `.jsp` saya tetap tidak bisa diakses meskipun sudah ada?<br/>
A: Periksa:

1. Apakah file `.jsp` dimiliki oleh user `tomcat`
2. Apakah berada di folder `webapps/app1/`
3. Apakah Tomcat berhasil men-deploy aplikasinya
4. Apakah akses dilakukan via path yang tepat

Q: Perlukah web.xml di setiap aplikasi Java saya?<br/>
A: Jika hanya ingin tes `.jsp`, tidak wajib. Tapi untuk aplikasi Java web formal (menggunakan servlet, filter, dll.), file `WEB-INF/web.xml` wajib ada.

Q: Apakah setup ini aman untuk server produksi?<br/>
A: **Ya, jika dikonfigurasi dengan benar:**

- Aktifkan SELinux dan atur boolean `httpd_can_network_connect`
- Gunakan HTTPS via Let's Encrypt (bisa pakai `mod_ssl`)
- Harden Tomcat dengan membatasi akses `manager`, `host-manager`, dsb.
