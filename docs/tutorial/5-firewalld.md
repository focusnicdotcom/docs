---
title: firewalld
description: Pengertian dan Tutorial Konfigurasi Firewalld di Linux
sidebar_position: 104
sidebar_label: firewalld
---
Firewalld adalah frontend manajemen firewall berbasis iptables/nftables, yang menyediakan kontrol akses jaringan secara dinamis (tanpa restart layanan) menggunakan zone dan service. Firewalld menggantikan cara lama mengelola firewall secara manual menggunakan iptables.

## Konsep Firewalld
Firewalld zone menentukan tingkat kepercayaan koneksi jaringan berdasarkan interface.

| Zone | Deskripsi | Default Policy | Kapan Digunakan |
| --- | --- | --- | --- |
| 🔒 `block` | Semua koneksi **masuk diblokir**, **kecuali** koneksi keluar. | **DROP** | Untuk interface yang sangat tidak dipercaya. |
| 🛑 `drop` | Semua koneksi **masuk dibuang tanpa pemberitahuan**. | **DROP** | Keamanan maksimum, stealth mode (tidak terlihat oleh penyerang). |
| 🧱 `dmz` (Demilitarized Zone) | Untuk server di DMZ; hanya service tertentu yang diizinkan. | **DROP** | Jika host ada di semi-public network, misalnya web/mail server. |
| 🌐 `external` | Untuk interface yang menghadap ke publik. Biasanya digunakan dengan NAT. | **DROP** | Server gateway atau router yang meneruskan koneksi ke LAN. |
| 🏠 `home` | Untuk jaringan yang dipercaya sebagian besar (rumah, Wi-Fi pribadi). | **ACCEPT** | PC/laptop pribadi di jaringan rumah. |
| 🏢 `internal` | Jaringan internal perusahaan/organisasi. | **ACCEPT** | Server atau workstation di LAN lokal yang dipercaya. |
| 🔁 `nm-shared` | Digunakan oleh **NetworkManager** untuk koneksi yang di-*share* antar perangkat. | **ACCEPT** | Jika koneksi dibagikan via hotspot/tethering dari host. |
| 🌎 `public` (Default) | Asumsinya adalah jaringan **tidak dipercaya**. | **DROP** | Untuk semua koneksi umum/internet (default pada banyak sistem). |
| ✅ `trusted` | **Semua koneksi diizinkan** tanpa filter. | **ACCEPT SEMUA** | Gunakan hanya untuk interface yang benar-benar aman. |
| 🧑‍💻 `work` | Jaringan kerja yang terpercaya, lebih ketat dari trusted. | **ACCEPT** | Laptop/PC kantor di LAN perusahaan. |

Contoh penggunaan zone firewalld
| Zona | Kepercayaan | Akses Masuk | Contoh Penggunaan |
| --- | --- | --- | --- |
| `trusted` | 🔓 Sangat tinggi | Semua diizinkan | Jaringan pribadi terisolasi |
| `home` | 👍 Tinggi | Default + sharing | Wi-Fi rumah |
| `work` | 👍 Tinggi | Default + ssh/samba | LAN kantor |
| `internal` | 👍 Tinggi | Akses layanan terbatas | VLAN internal, backend server |
| `public` | ⚠️ Rendah | Hanya yang diizinkan | Internet/public LAN |
| `dmz` | ⚠️ Rendah | Service tertentu saja | Server DMZ (web/mail) |
| `external` | ⚠️ Rendah | NAT routing, terbatas | Router/gateway NAT |
| `block` | ❌ Tidak dipercaya | Drop semua koneksi | Koneksi dari sumber berisiko |
| `drop` | ❌ Tidak dipercaya | Silent drop (stealth) | Server yang tidak ingin terdeteksi |
| `nm-shared` | 🔄 Spesial | Dikonfigurasi otomatis | NetworkManager shared connection |

Firewalld menggunakan nama layanan yang telah didefinisikan (misalnya: `ssh`, `http`, `https`) untuk membuka port. Berikut adalah list default service dari firewalld:
```
RH-Satellite-6 RH-Satellite-6-capsule amanda-client amanda-k5-client amqp amqps apcupsd audit bacula bacula-client bb bgp bitcoin bitcoin-rpc bitcoin-testnet bitcoin-testnet-rpc bittorrent-lsd ceph ceph-mon cfengine cockpit collectd condor-collector ctdb dhcp dhcpv6 dhcpv6-client distcc dns dns-over-tls docker-registry docker-swarm dropbox-lansync elasticsearch etcd-client etcd-server finger foreman foreman-proxy freeipa-4 freeipa-ldap freeipa-ldaps freeipa-replication freeipa-trust ftp galera ganglia-client ganglia-master git grafana gre high-availability http https imap imaps ipp ipp-client ipsec irc ircs iscsi-target isns jenkins kadmin kdeconnect kerberos kibana klogin kpasswd kprop kshell kube-apiserver ldap ldaps libvirt libvirt-tls lightning-network llmnr managesieve matrix mdns memcache minidlna mongodb mosh mountd mqtt mqtt-tls ms-wbt mssql murmur mysql nbd nfs nfs3 nmea-0183 nrpe ntp nut openvpn ovirt-imageio ovirt-storageconsole ovirt-vmconsole plex pmcd pmproxy pmwebapi pmwebapis pop3 pop3s postgresql privoxy prometheus proxy-dhcp ptp pulseaudio puppetmaster quassel radius rdp redis redis-sentinel rpc-bind rquotad rsh rsyncd rtsp salt-master samba samba-client samba-dc sane sip sips slp smtp smtp-submission smtps snmp snmptrap spideroak-lansync spotify-sync squid ssdp ssh steam-streaming svdrp svn syncthing syncthing-gui synergy syslog syslog-tls telnet tentacle tftp tftp-client tile38 tinc tor-socks transmission-client upnp-client vdsm vnc-server wbem-http wbem-https wsman wsmans xdmcp xmpp-bosh xmpp-client xmpp-local xmpp-server zabbix-agent zabbix-server
```

Dalam sistem manajemen firewall firewalld, aturan dapat diklasifikasikan menjadi dua jenis: permanen dan sementara. Ketika sebuah aturan ditambahkan atau dimodifikasi, perilaku firewall yang sedang aktif akan segera diperbarui. Namun, penting untuk dicatat bahwa pada saat reboot berikutnya, semua perubahan yang bersifat sementara ini akan diabaikan, dan aturan yang telah ditetapkan sebelumnya akan kembali diterapkan.

Sebagian besar operasi yang dilakukan dengan menggunakan `firewall-cmd` dapat memanfaatkan flag `--permanent`. Flag ini menandakan bahwa modifikasi yang dilakukan bersifat permanen, sehingga perubahan tersebut akan tetap ada bahkan setelah sistem di-reboot. Pemisahan antara aturan permanen dan langsung ini memberikan fleksibilitas, memungkinkan administrator untuk menguji berbagai aturan dalam lingkungan firewall yang aktif tanpa risiko kehilangan konfigurasi yang telah diatur sebelumnya. Jika ditemukan masalah, administrator dapat dengan mudah memuat ulang konfigurasi tanpa dampak jangka panjang.

Selain itu, flag `--permanent` dapat digunakan untuk membangun dan menyusun seluruh kumpulan aturan secara bertahap. Dengan cara ini, semua perubahan dapat diterapkan sekaligus ketika perintah reload dijalankan, memastikan bahwa semua aturan baru berfungsi secara koheren dan sesuai dengan ekspektasi. Metode ini tidak hanya mengoptimalkan manajemen aturan firewall, tetapi juga meningkatkan keandalan dan keamanan sistem secara keseluruhan.

## Cek Firewalld
Jalankan perintah berikut untuk mengecek status firewalld:
```
firewall-cmd --state
```
Contoh output:
```
running
```
Install firewalld apabila belum terinstall
:::info
Gunakan package manager sesuai distribusi sistem operasi Linux Anda.
:::
```
dnf install firewalld
systemctl enable --now firewalld
```
Cek default zone
```
firewall-cmd --get-default-zone
```
Contoh output:
```
public
```
Cek zone aktif:
```
firewall-cmd --get-active-zones
```
Contoh ouput:
```
public
  interfaces: ens18
```
Cek zone lainnya yang tersedia:
```
firewall-cmd --get-zones
```
Contoh output:
```
block dmz drop external home internal nm-shared public trusted work
```
Cek rule yang diterapkan pada zone `public`:
```
firewall-cmd --list-all --zone=public
```
Contoh output
```
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: ens18
  sources: 
  services: cockpit dhcpv6-client ssh
  ports: 
  protocols: 
  forward: no
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: 
```
Cek ports/services di firewalld, bisa menggunakan opsi `--zone=$NAMA_ZONE` jika ingin spesifik:
```
firewall-cmd --list-ports
firewall-cmd --list-services
```
Cek semua zone serta rule yang diterapkan:
```
firewall-cmd --list-all-zones
```
Anda bisa juga menggunakan `less` agar mudah melihat list yang muncul
```
firewall-cmd --list-all-zones | less
```
## Konfigurasi Firewalld
Pada sistem manajemen firewall `firewalld`, ketika sebuah `ports` atau `services` ditambahkan, itu berarti bahwa akses untuk koneksi masuk (incoming) dan keluar (outgoing) melalui port tersebut diizinkan. Penambahan ini secara otomatis membuka jalur komunikasi untuk service yang bersangkutan, memungkinkan interaksi dengan aplikasi dan pengguna luar.

Namun, jika sebuah port atau layanan tidak ditambahkan atau didefinisikan dalam firewalld, maka port atau layanan tersebut akan tetap tertutup dan diblokir secara default. Dalam keadaan ini, hanya koneksi keluar dari server yang diizinkan, sehingga server dapat mengirimkan data ke luar tanpa masalah, tetapi tidak dapat menerima koneksi dari sumber eksternal. Ini menciptakan lapisan keamanan tambahan, karena hanya layanan yang secara eksplisit diizinkan yang dapat berinteraksi dengan sistem.

Dengan demikian, pengelolaan port dan layanan dalam firewalld menjadi sangat penting untuk memastikan bahwa hanya komunikasi yang diperlukan yang diizinkan, sambil menjaga integritas dan keamanan server dari potensi ancaman yang berasal dari koneksi yang tidak sah.

### Menambahkan Port/Service
Perintah untuk menambah port `8080` sementara hingga reboot berikutnya:
```
firewall-cmd --add-port=8080/tcp
```
Perintah untuk menambah port `8080` secara permanent:
```
firewall-cmd --add-port=8080/tcp --permanent
```
Perintah untuk menambah service `http` sementara hingga reboot berikutnya:
:::info
Untuk menambahkan service pada firewalld, diasumsikan service tersebut sudah ada di predefined service firewalld, jika tidak maka silahkan tambahkan portnya saja.
:::
```
firewall-cmd --add-service=http
```
Perintah untuk menambah service `http` secara permanent:
```
firewall-cmd --add-service=http --permanent
```
Jika semua port/service sudah ditambahkan, maka langkah selanjutnya adalah me-reload firewalld:
```
firewall-cmd --reload
```
Lalu verifikasi ports/services secara global
```
firewall-cmd --list-ports
firewall-cmd --list-services
```
Verifikasi ports/services yang di set secara permanent
```
firewall-cmd --list-ports --permanent
firewall-cmd --list-services --permanent
```

### Menghapus Port/Service
Perintah untuk menghapus port `8080` sementara hingga reboot berikutnya:
```
firewall-cmd --remove-port=8080/tcp
```
Perintah untuk menghapus port `8080` secara permanent:
```
firewall-cmd --remove-port=8080/tcp --permanent
``` 
Perintah untuk menghapus service `httpd` sementara hingga reboot berikutnya:
```
firewall-cmd --remove-service=http
```
Perintah untuk menghapus service `httpd` secara pemenent:
```
firewall-cmd --remove-service=http --permanent
```
### Menambah Zone di Firewalld
Meskipun cara ini jarang diimplementasikan, namun membuat zone pada Firewalld memberikan fleksibilitas kontrol keamanan jaringan yang lebih tersegmentasi dan terstruktur, terutama ketika server atau host memiliki banyak interface, subnet, atau sebagai gateway network.

Contoh penggunaan
| Use Case | Nama Zona | Fungsi |
| --- | --- | --- |
| 🔌 Server dengan 2 NIC (1 ke internet, 1 ke LAN) | `lan` dan `wan` | `wan` hanya buka 80/443, `lan` bisa akses 22 dan DB |
| 🌐 Web server yang juga jadi VPN endpoint | `vpn` dan `public` | `vpn` boleh akses semua, `public` hanya 80/443 |
| 🧪 Lab KVM / Docker host | `lab-internal`, `external` | Hanya IP tertentu di `lab-internal` bisa SSH ke host |
| 🏢 Kantor dengan VLAN berbeda | `hr-zone`, `it-zone`, `guest-zone` | Masing-masing zona punya akses berbeda (misal: `hr-zone` boleh ke payroll, `guest-zone` tidak) |
| 📦 Isolasi layanan kritikal | `db-zone`, `web-zone` | `db-zone` hanya terima dari `web-zone`, bukan public |

Buat zone baru:
```
firewall-cmd --permanent --new-zone=internal-lan
```
Tambahkan interface `ens18` ke zone ini:
```
firewall-cmd --permanent --zone=internal-lan --add-interface=ens18
```
Tambahkan service/port ke zone ini:
```
firewall-cmd --permanent --zone=internal-lan --add-service=ssh
firewall-cmd --permanent --zone=internal-lan --add-port=8080/tcp
```
Reload firewalld agar rule segera aktif:
```
firewall-cmd --reload
```
Verifikasi:
```
firewall-cmd --get-active-zones
```
Contoh output:
```
internal-lan
  interfaces: ens18
```
### Mengubah Default Zone
Cek default zone saat ini:
```
firewall-cmd --get-default-zone
```
Contoh output:
```
public
```
Mengubah default zone ke `home`:
```
firewall-cmd --set-default-zone=home
```
Jika Anda mempunya interface lebih dari satu, Anda juga bisa menerapkan zone secara spesifik ke interface:
```
firewall-cmd --zone=home --change-interface=ens18 --permanent
firewall-cmd --reload
```
Lalu verifikasi:
```
firewall-cmd --get-active-zones
```
Contoh output:
```
home
  interfaces: ens18
```
### Whitelist dan Blocklist IP Menggunakan rich-rule
#### Whitelist
Mengizinkan hanya IP tertentu (misalnya 192.168.167.12) mengakses SSH (port 22) di firewalld dan memblokir semua IP lain, Anda bisa menggunakan rich rules.

Hapus service atau port ssh dan reload firewalld:
```
firewall-cmd --remove-port=22/tcp --permanent
firewall-cmd --remove-service=ssh --permanent
firewall-cmd --reload
```

Tambahkan rule untuk mengizinkan akses `SSH` dari IP tertentu dan reload firewalld:
:::info
Jangan tambahkan `--add-service=http` atau `https`, karena itu akan membuka port ke semua IP. Gunakan port saja.
:::

```
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp accept' ## per IP
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.162.0/24 port port=22 protocol=tcp accept' ## per subnet
firewall-cmd --reload
```

Kemudian verifikasi:
```
firewall-cmd --list-rich-rules
```

Contoh output:
```
rule family="ipv4" source address="192.168.167.12" port port="22" protocol="tcp" accept
```

Perintah untuk menghapus rich rules firewalld:
```
firewall-cmd --permanent --remove-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp accept'
firewall-cmd --reload
```
#### Blacklist
Menolak atau drop IP tertentu (misalnya 192.168.167.12) mengakses SSH (port 22) di firewalld dan memblokir semua IP lain, Anda bisa menggunakan rich rules.

Tambahkan rule untuk mengizinkan akses `SSH` dari IP tertentu dan reload firewalld:

```
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp drop' ## per IP
firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=192.168.162.0/24 port port=22 protocol=tcp drop' ## per subnet
firewall-cmd --reload
```

Kemudian verifikasi:
```
firewall-cmd --list-rich-rules
```

Contoh output:
```
rule family="ipv4" source address="192.168.167.12" port port="22" protocol="tcp" drop
```

Perintah untuk menghapus rich rules firewalld:
```
firewall-cmd --permanent --remove-rich-rule='rule family=ipv4 source address=192.168.167.12 port port=22 protocol=tcp drop'
firewall-cmd --reload
```
## Kesimpulan
Dengan menggunakan Firewalld, kita dapat mengelola aturan firewall di Linux dengan cara yang lebih dinamis, terstruktur, dan mudah dipahami. Konsep zona memungkinkan administrator untuk mengelompokkan interface berdasarkan tingkat kepercayaan dan memberikan kontrol akses yang lebih fleksibel dan aman.

Firewalld juga mendukung konfigurasi real-time tanpa harus memutus koneksi aktif, serta menyediakan fitur rich rule untuk kebutuhan keamanan yang lebih detail. Hal ini menjadikannya pilihan yang sangat baik untuk penggunaan di lingkungan server produksi, desktop, maupun gateway jaringan.

Rangkuman perintah firewalld:

| Penjelasan | Perintah |
| --- | --- |
| Cek status firewall | `firewall-cmd --state` |
| Tambah port permanen | `--add-port=xxxx/proto --permanent` |
| Tambah service permanen | `--add-service=ssh --permanent` |
| Reload aturan | `firewall-cmd --reload` |
| Lihat aturan aktif | `firewall-cmd --list-all` |
| Ganti zone default | `--set-default-zone=home` |
