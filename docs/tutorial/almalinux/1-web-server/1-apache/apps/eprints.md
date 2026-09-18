---
title: Panduan Lengkap Cara Install EPrints menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install EPrints menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: EPrints
---

EPrints adalah salah satu perangkat lunak **repository digital open source** yang banyak digunakan oleh perguruan tinggi, lembaga riset, dan organisasi besar untuk mengelola publikasi ilmiah. Dengan dukungan **Apache Web Server**, sistem operasi **AlmaLinux 8**, serta database yang stabil, kita dapat membangun repository yang cepat, aman, dan mudah diakses. Panduan ini akan memberikan panduan langkah demi langkah yang sangat rinci tentang cara melakukan instalasi **EPrints** di atas server AlmaLinux 8 dengan menggunakan Apache.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai proses instalasi, pastikan bahwa server AlmaLinux 8 telah diperbarui ke versi terbaru. Gunakan perintah berikut untuk memastikan sistem telah menggunakan paket terbaru:
```
dnf update -y
dnf install epel-release -y
```

### Install Apache

Apache adalah web server yang andal dan digunakan secara luas dalam lingkungan produksi. Untuk menginstalnya, jalankan perintah berikut:
```
dnf install httpd -y
```
Setelah instalasi selesai, aktifkan dan mulai layanan Apache dengan perintah berikut:
```
systemctl enable --now httpd
```
Untuk mengizinkan akses ke server melalui HTTP dan HTTPS, izinkan firewall:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

### Install Perl

EPrints membutuhkan beberapa paket dependensi seperti Perl modules dan library tambahan. Kita dapat menginstalnya dengan perintah berikut:
```
dnf config-manager --set-enabled powertools
dnf install libxml2 libxslt httpd mod_perl perl-Apache-DBI perl-DBI perl-DBD-MySQL perl-IO-Socket-SSL \
    perl-Time-HiRes perl-CGI perl-Digest-MD5 perl-Digest-SHA perl-Digest-SHA1 perl-JSON perl-XML-LibXML \
    perl-XML-LibXSLT perl-XML-SAX perl-MIME-Lite perl-Text-Unidecode perl-JSON perl-Unicode-Collate \
    perl-LWP-Protocol-https perl-IO-String tetex-latex wget gzip tar ImageMagick poppler-utils \
    chkconfig unzip cpan python3-html2text expat-devel libxslt-devel
```

### Install MariaDB

MariaDB merupakan pengganti dari MySQL dan kompatibel untuk aplikasi berbasis MySQL. Jalankan perintah berikut untuk menginstalnya:
```
dnf module list mariadb
```
Contoh output:
```
AlmaLinux 8 - AppStream
Name                                Stream                               Profiles                                               Summary                                   
mariadb                             10.3 [d]                             client, galera, server [d]                             MariaDB Module                            
mariadb                             10.5                                 client, galera, server [d]                             MariaDB Module                            
mariadb                             10.11                                client, galera, server [d]                             MariaDB Module                            

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```
Dari output diatas terlihat bahwa tersedia versi default yang tersedia MariaDB yaitu versi 10.11 (terbaru dari bawaan OS). Namun, kita akan menggunakan MariaDB versi 11.4.7 dengan menggunakan repository resmi https://mariadb.org/download/ lalu reset mariadb agar tidak menggunakan default repository dari OS:
```
dnf module reset mariadb
```
Jalankan perintah berikut untuk menambahkan repository MariaDB versi 11.4.7:
```
nano /etc/yum.repos.d/MariaDB.repo
```
Tambahkan parameter berikut:
```
# MariaDB 11.4 RedHatEnterpriseLinux repository list - created 2025-07-31 14:04 UTC
# https://mariadb.org/download/
[mariadb]
name = MariaDB
# rpm.mariadb.org is a dynamic mirror if your preferred mirror goes offline. See https://mariadb.org/mirrorbits/ for details.
# baseurl = https://rpm.mariadb.org/11.4/rhel/$releasever/$basearch
baseurl = https://mirror.its.dal.ca/mariadb/yum/11.4/rhel/$releasever/$basearch
module_hotfixes = 1
# gpgkey = https://rpm.mariadb.org/RPM-GPG-KEY-MariaDB
gpgkey = https://mirror.its.dal.ca/mariadb/yum/RPM-GPG-KEY-MariaDB
gpgcheck = 1
```
Lalu jalankan perintah berikut untuk menginstall MariaDB:
```
dnf install MariaDB-server MariaDB-client
```
Enable dan aktifkan service MariaDB:
```
systemctl enable --now mariadb
systemctl status mariadb
```
Sebelum digunakan untuk produksi atau testing, sebaiknya amankan terlebih dahulu instalasi MariaDB dengan menjalankan perintah berikut:
```
mariadb-secure-installation
```
Kemudian ikuti petunjuk yang muncul:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

## Install EPrints

Sebelum menginstall EPrints versi 3.4.6, kita akan membuat user `eprints` yang nantinya user ini akan menjalankan script instalasi dari EPrints serta membuat database dan virtualhost.

Buat user eprints:
```
adduser eprints
usermod -aG apache eprints
usermod -aG eprints apache
```
Download file EPrints dan letakkan pada direktori sesuai virtualhost:
```
mkdir /opt/eprints3
chown eprints:eprints /opt/eprints3
chmod 2775 /opt/eprints3
su eprints
git clone https://github.com/eprints/eprints3.4.git /opt/eprints3
cd /opt/eprints3
git checkout tags/v3.4.6
```
Jalankan perintah berikut untuk instalasi EPrints:
```
cd /opt/eprints3
bin/epadmin create pub
```
Berikut adalah contoh output instruksi instalasi EPrints:
```
Archive ID? repo
Configure vital settings? [yes] ? [ENTER]
Hostname? focusnic.biz.id
Webserver Port [80] ? [ENTER]
Path [/] ? [ENTER]
HTTPS Hostname [] ? [ENTER]
Administrator Email? admin@focusnic.biz.id
Archive Name [Test Repository] ? Focusnic Repository
Organisation Name [Organisation of Test] ? IT
Write these core settings? [yes] ? [ENTER]
Configure database? [yes] ? [ENTER]
Configuring Database for: repo
Database Name [repo] ? [ENTER]
MySQL Host [localhost] ? [ENTER]
MySQL Port (# for no setting) [#] ? [ENTER] 
MySQL Socket (# for no setting) [#] ? [ENTER]
Database User [repo] ? [ENTER]
Database Password [Lwzkn1VBYwLdCdlv] ? [ENTER] 
Database Engine [InnoDB] ? [ENTER]
Write these database settings? [yes] ? [ENTER]
Create database "repo" [yes] ? [ENTER]
Database Superuser Username [root] ? [ENTER]
Database Superuser Password? [ROOT_PASSWORD]
Create database tables? [yes] ? [ENTER]
Create an initial user? [yes] ? [ENTER] 
Enter a username [admin] ? [ENTER]
Select a user type (user|editor|admin) [admin] ? [ENTER]
Enter Password? [STRONG_PASSWORD]
Email? admin@focusnic.biz.id
Do you want to build the static web pages? [yes] ? [ENTER]
Do you want to import the LOC subjects and sample divisions? [yes] ? [ENTER]
Do you want to update the apache config files? (you still need to add the 'Include' line) [yes] ? [ENTER]
Wrote /opt/eprints3/cfg/apache.conf
Wrote /opt/eprints3/cfg/apache_ssl.conf
Wrote /opt/eprints3/cfg/perl_module_isolation.conf
Wrote /opt/eprints3/cfg/perl_module_isolation_vhost.conf
Wrote /opt/eprints3/cfg/apache/repo.conf
```
Kemudian tambahkan konfigurasi virtualhost EPrints berikut dengan user `root` lalu restart Apache untuk menyimpan perubahan:
```
exit
echo "Include /opt/eprints3/cfg/apache.conf" >> /etc/httpd/conf/httpd.conf
systemctl restart httpd
systemctl status httpd
```

Silahkan akses instalasi EPrints pada browser dengan mengetik nama domain atau IP
![](/img/almalinux8-lamp-apps-eprints1.png) <br/>
Akses halaman admin EPrints melalui `http://$DOMAIN/cgi/users/home`
![](/img/almalinux8-lamp-apps-eprints2.png) <br/>

### SSL

Mengaktifkan SSL untuk EPrints sebagai keamanan tambahan menggunakan SSL Let's Encrypt via Certbot. Jalankan perintah berikut untuk menginstall dependensi certbot:
```
dnf install certbot python3-certbot-apache -y
systemctl restart httpd
```
Kemudian request SSL dengan menjalankan perintah berikut:
```
certbot --non-interactive -m admin@focusnic.biz.id --agree-tos --no-eff-email --apache certonly -d focusnic.biz.id
```
File SSL akan disimpan pada direktori berikut:
```
Certificate is saved at: /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
```
Lalu tambahkan virtualhost HTTPS pada file berikut:
```
nano /opt/eprints3/cfg/apache/repo.conf
```
Tambahkan parameter berikut pada bagian paling bawah setelah virtualhost HTTP:
```jsx showLineNumbers title="/opt/eprints3/cfg/apache/repo.conf"
<VirtualHost *:443>
    ServerName focusnic.biz.id
    ServerAdmin admin@focusnic.biz.id

    SSLEngine on
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLHonorCipherOrder on
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256

    SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem

    SetEnvIf User-Agent ".*MSIE.*" \
        nokeepalive ssl-unclean-shutdown \
        downgrade-1.0 force-response-1.0

    <Location "">
      PerlSetVar EPrints_ArchiveID repo
      
      Options +ExecCGI
      <IfModule mod_authz_core.c>
         Require all granted
      </IfModule>
      <IfModule !mod_authz_core.c>
         Order allow,deny
         Allow from all
      </IfModule>
    </Location>

    LimitRequestBody 1073741824
    PerlTransHandler +EPrints::Apache::Rewrite

    Include /opt/eprints3/cfg/perl_module_isolation_vhost.conf

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined 
</VirtualHost>
```
Jalankan perintah berikut untuk regenerate virtualhost:
```
/opt/eprints3/bin/generate_apacheconf --system --replace
```
Contoh output:
```
Wrote /opt/eprints3/cfg/apache.conf
Wrote /opt/eprints3/cfg/apache_ssl.conf
Wrote /opt/eprints3/cfg/perl_module_isolation.conf
Wrote /opt/eprints3/cfg/perl_module_isolation_vhost.conf
Wrote /opt/eprints3/cfg/apache/repo.conf

You must restart apache for any changes to take effect!
```
Kemudian restart Apache menggunakan user `root` untuk menyimpan perubahan:
```
exit
apachectl configtest
systemctl restart httpd
```

Kemudian akses EPrints menggunakan domain `https://$DOMAIN`
![](/img/almalinux8-lamp-apps-eprints3.png) <br/>

## Troubleshooting

1. Error readdir() attempted on invalid dirhandle LIB pada EPrints <br/>
Penyebab: Menjalankan epadmin dari folder yang salah (misalnya di `public_html`) sehingga EPrints tidak menemukan `perl_lib`. Solusinya selalu jalankan perintah dari folder instalasi inti:
```
cd /opt/eprints3
bin/epadmin create pub
```

2. Modul Perl Tidak Lengkap <br/>
Pada versi EPrints 3.4.6 dibutuhkan modul tambahan (CGI, JSON, LWP). Jalankan perintah berikut untuk menginstall dengan benar
```
dnf config-manager --set-enabled powertools
dnf install libxml2 libxslt httpd mod_perl perl-Apache-DBI perl-DBI perl-DBD-MySQL perl-IO-Socket-SSL \
    perl-Time-HiRes perl-CGI perl-Digest-MD5 perl-Digest-SHA perl-Digest-SHA1 perl-JSON perl-XML-LibXML \
    perl-XML-LibXSLT perl-XML-SAX perl-MIME-Lite perl-Text-Unidecode perl-JSON perl-Unicode-Collate \
    perl-LWP-Protocol-https perl-IO-String tetex-latex wget gzip tar ImageMagick poppler-utils \
    chkconfig unzip cpan python3-html2text expat-devel libxslt-devel
```

3. Error mod_perl cannot handle dir_perms parameter EPrints <br/>

Untuk memperbaikinya, silahkan edit file berikut `lib/syscfg.d/core.pl` dan mengatur `$c->{dir_perms}` sebagai berikut:
```
nano /opt/eprints3/lib/syscfg.d/core.pl
```
Ubah menjadi value berikut:
```
$c->{dir_perms} = '0775';
```

## Kesimpulan

Instalasi **EPrints menggunakan Apache di AlmaLinux 8** merupakan langkah penting untuk membangun **repository ilmiah modern** yang dapat diakses secara global. Dengan panduan ini, mulai dari **persiapan server, instalasi Apache, konfigurasi database MariaDB, pemasangan dependensi, hingga setup repository** dapat dilakukan secara sistematis.

Q: Apakah E-Prints bisa dijalankan di AlmaLinux selain versi 8? <br/>
A: Ya, EPrints dapat dijalankan di AlmaLinux 9 atau CentOS/RHEL, namun tutorial ini berfokus pada AlmaLinux 8 karena stabilitas dan dukungan komunitasnya yang luas.

Q: Apakah wajib menggunakan Apache untuk EPrints? <br/>
A: EPrints didesain untuk berjalan dengan Apache Web Server, sehingga direkomendasikan menggunakan Apache daripada Nginx agar lebih kompatibel.

Q: Apa perbedaan epadmin create archive dengan epadmin create zero? <br/>
A: 
- `archive` → digunakan untuk membuat repository ilmiah penuh.
- `zero` → template kosong (biasanya untuk development/testing).

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
