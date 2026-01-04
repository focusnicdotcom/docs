---
title: iperf3
description: How to Install and Use iperf3 on Linux
sidebar_position: 107
sidebar_label: iperf3
---

**Iperf3** is a **network performance testing tool** widely used by system and network administrators to measure **throughput, bandwidth, latency**, and connection stability between two hosts. This guide details **how to install and use Iperf3 on Linux**, including server-client configuration and TCP/UDP testing.

## Preparation

Here is the test scenario:
```
[Server] ←→ [Router/Switch] ←→ [Client]
192.168.167.89                 192.168.167.67
```

Run the following command for each Linux distribution if iperf3 is not installed:
```
# AlmaLinux
dnf install iperf3 -y

# Ubuntu/Debian
apt-get install iperf3 -y
```

## Upload Test (Client → Server)
:::info
Measures the upload speed from client to server.
:::

Run the following command on the iperf server:
```
iperf3 -s -p 5201
```
An example of the output is:
```
Server listening on 5201
```
Then run the following command on the iperf client:
```
iperf3 -c 192.168.167.89 -p 5201 -t 30 -i 5
```
Output example:
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

The explanation of the iperf3 command above is as follows:
- `-c`: connect to server
- `-p`: port number
- `-t`: test duration (30 seconds)
- `-i`: interval report (5 seconds)


## Download Test (Server → Client)
:::info
Measures the download speed from server to client. In this test, the client will download data from the server, and the server will upload it. Reverse mode (server sends, client receives).
:::

Run the following command on the iperf server:
```
iperf3 -s -p 5201
```

Then, run the following command by adding the `-R` (reverse test, client receives data) parameter to the iperf client:
```
iperf3 -c 192.168.167.89 -p 5201 -t 30 -i 5 -R
```

Output example:
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
Test with multiple parallel connections.
:::

Run the following command on the iperf server:
```
iperf3 -s -p 5201
```
Then run the following command to test 4 parallel tests on the client:
```
iperf3 -c 192.168.167.89 -p 5201 -t 30 -i 5 -P 4
```

## UDP Test

Run the following command on the iperf server:
```
iperf3 -s -p 5201
```

Run the following command on the iperf client side:
```
iperf3 -c 192.168.167.89 -p 5201 -u -b 100M -t 10
```
Here is an example of the output:
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

Explanation of the iperf command above:
- `-u`: UDP mode
- `-b`: target bandwidth
