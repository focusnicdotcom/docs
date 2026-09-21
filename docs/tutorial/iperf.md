---
title: iperf3
description: Tutorial Cara Install dan Menggunakan iperf3 di Linux
sidebar_position: 107
sidebar_label: iperf3
---

**Iperf3** adalah salah satu **alat uji kinerja jaringan (network performance testing tool)** yang banyak digunakan oleh administrator sistem dan jaringan untuk mengukur **throughput, bandwidth, latency**, dan stabilitas koneksi antara dua host. Panduan ini membahas secara detail **cara install dan menggunakan Iperf3 di Linux**, termasuk konfigurasi server-client, dan pengujian TCP/UDP.

## Persiapan

Berikut adalah skenario pengujian:
```
[Server] ←→ [Router/Switch] ←→ [Client]
192.168.167.89                 192.168.167.67
```

Jalankan perintah berikut untuk masing-masing distribusi Linux apabila iperf3 belum terinstall:
```
# AlmaLinux
dnf install iperf3 -y

# Ubuntu/Debian
apt-get install iperf3 -y
```

## Upload Test (Client → Server)
:::info
Mengukur kecepatan upload dari client ke server.
:::

Jalankan perintah berikut pada iperf server:
```
iperf3 -s -p 5201
```
Contoh outputnya adalah:
```
Server listening on 5201
```

Lalu jalankan perintah berikut pada iperf client:
```
iperf3 -c 192.168.167.89 -p 5201 -t 30 -i 5
```
Contoh output:
```
Connecting to host 192.168.167.89, port 5201
[  5] local 192.168.167.67 port 35532 connected to 192.168.167.89 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-5.00   sec  10.3 GBytes  17.7 Gbits/sec    0   3.10 MBytes       
[  5]   5.00-10.00  sec  10.8 GBytes  18.5 Gbits/sec    0   3.10 MBytes       
[  5]  10.00-15.00  sec  10.7 GBytes  18.4 Gbits/sec    0   3.10 MBytes       
[  5]  15.00-20.00  sec  10.2 GBytes  17.5 Gbits/sec    0   3.10 MBytes       
[  5]  20.00-25.00  sec  10.9 GBytes  18.7 Gbits/sec    0   3.10 MBytes       
[  5]  25.00-30.00  sec  10.4 GBytes  17.9 Gbits/sec    0   3.10 MBytes       
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.00  sec  63.3 GBytes  18.1 Gbits/sec    0             sender
[  5]   0.00-30.04  sec  63.3 GBytes  18.1 Gbits/sec                  receiver

iperf Done.
```

Penjelasan perintah iperf3 diatas adalah sebagai berikut:
- `-c`: connect ke server
- `-p`: port number
- `-t`: durasi test (30 detik)
- `-i`: interval report (5 detik)


## Download Test (Server → Client)
:::info
Mengukur kecepatan download dari server ke client. Pada test kali ini klien akan mendownload data dari server, dan server akan mengupload. Reverse mode (server sends, client receives).
:::

Jalankan perintah berikut pada iperf server:
```
iperf3 -s -p 5201
```

Lalu, jalankan perintah berikut dengan menambahkan parameter `-R` (reverse test, client receives data) pada iperf client:
```
iperf3 -c 192.168.167.89 -p 5201 -t 30 -i 5 -R
```

Contoh output:
```
Reverse mode, remote host 192.168.167.89 is sending
[  5] local 192.168.167.67 port 42108 connected to 192.168.167.89 port 5201
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-5.00   sec  10.4 GBytes  17.9 Gbits/sec                  
[  5]   5.00-10.00  sec  11.1 GBytes  19.0 Gbits/sec                  
[  5]  10.00-15.00  sec  11.0 GBytes  18.8 Gbits/sec                  
[  5]  15.00-20.00  sec  10.9 GBytes  18.7 Gbits/sec                  
[  5]  20.00-25.00  sec  10.9 GBytes  18.7 Gbits/sec                  
[  5]  25.00-30.00  sec  11.0 GBytes  18.9 Gbits/sec                  
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.04  sec  65.2 GBytes  18.7 Gbits/sec    1             sender
[  5]   0.00-30.00  sec  65.2 GBytes  18.7 Gbits/sec                  receiver

iperf Done.
```

## Parallel Test
:::info
Test dengan beberapa koneksi parallel.
:::

Jalankan perintah berikut pada iperf server:
```
iperf3 -s -p 5201
```

Lalu jalankan perintah berikut untuk menguji 4 paralel test pada client:
```
iperf3 -c 192.168.167.89 -p 5201 -t 30 -i 5 -P 4
```

## UDP Test

Jalankan perintah berikut pada iperf server:
```
iperf3 -s -p 5201
```

Jalankan perintah berikut pada sisi iperf client:
```
iperf3 -c 192.168.167.89 -p 5201 -u -b 100M -t 10
```
Berikut contoh outputnya:
```
Connecting to host 192.168.167.89, port 5201
[  5] local 192.168.167.67 port 37263 connected to 192.168.167.89 port 5201
[ ID] Interval           Transfer     Bitrate         Total Datagrams
[  5]   0.00-1.00   sec  11.9 MBytes  99.9 Mbits/sec  8626  
[  5]   1.00-2.00   sec  11.9 MBytes   100 Mbits/sec  8633  
[  5]   2.00-3.00   sec  11.9 MBytes   100 Mbits/sec  8632  
[  5]   3.00-4.00   sec  11.9 MBytes   100 Mbits/sec  8633  
[  5]   4.00-5.00   sec  11.9 MBytes   100 Mbits/sec  8632  
[  5]   5.00-6.00   sec  11.9 MBytes   100 Mbits/sec  8633  
[  5]   6.00-7.00   sec  11.9 MBytes   100 Mbits/sec  8633  
[  5]   7.00-8.00   sec  11.9 MBytes   100 Mbits/sec  8632  
[  5]   8.00-9.00   sec  11.9 MBytes   100 Mbits/sec  8633  
[  5]   9.00-10.00  sec  11.9 MBytes   100 Mbits/sec  8632  
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Jitter    Lost/Total Datagrams
[  5]   0.00-10.00  sec   119 MBytes   100 Mbits/sec  0.000 ms  0/86319 (0%)  sender
[  5]   0.00-10.04  sec   119 MBytes  99.6 Mbits/sec  0.010 ms  0/86319 (0%)  receiver

iperf Done.
```

Penjelasan perintah iperf diatas:
- `-u`: UDP mode
- `-b`: bandwidth target
