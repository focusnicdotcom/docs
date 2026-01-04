---
title: iptables
description: Tutorial iptables in Linux
sidebar_position: 105
sidebar_label: iptables
---

`iptables` is a command-line tool in Linux for setting up a firewall based on **network packet filtering**. It works on top of **netfilter**, part of the Linux kernel, and
 can be used for:

- Allow or block connections.
- Restrict port/IP access.
- Prevent DDoS/syn flood attacks.
- Perform NAT (Network Address Translation)

There are several tables that can be used, and each table has several built-in chains. We can also create our own chains. Each chain is like a list of rules that can match
with certain packages. Each rule tells us what to do with the matching packet. This is called a *target*, which can be a jump to a chain that we create ourselves in the same table.

iptables uses rules to determine what to do with network packets. This utility consists of the following components:

- Tables: Tables are files that group similar rules. Tables consist of several rule chains.
- Chains: Chains are a series of rules. When a packet is received, iptables finds the appropriate table and filters it through the rule chain until it finds a match.
- Rules: Rules are statements that define the conditions for matching packets, which are then sent to the target.
- Target: The target is the decision on what to do with the packet. The packet is either accepted, discarded, or rejected.

## iptables concepts
iptables has several types of tables:

| Table | Function
| --- | --- |
| `filter` | Default, used to allow or block traffic |
| `nat` | For Network Address Translation |
| `mangle` | To modify packets |
| `raw` | For low-level control, usually used with connection tracking |

Chain in iptables, which determines when the rule is executed:

| Chain | Function |
| --- | --- |
| `INPUT` | Traffic entering the system |
| `OUTPUT` | Traffic leaving the system |
| `FORWARD` | Traffic passing through the system (routing) |
| `PREROUTING` | For NAT or modification before routing |
| `POSTROUTING` | For NAT after routing |

### Filter Table (`iptables -t filter`). 
The main and default table, used to control whether a packet is allowed or denied.
| Chain | Function |
| --- | --- |
| `INPUT` | Incoming packets to the local system (e.g. SSH, HTTP to the server itself) |
| `FORWARD` | Packets **forwarded** (not to this host) |
| `OUTPUT` | Packets **outgoing from the local system** |

### NAT Table (`iptables -t nat`)
Used for Network Address Translation (NAT), such as masquerade, DNAT, and SNAT.
| Chain | Functions |
| --- | --- |
| `PREROUTING` | Modifying packets before routing (e.g. DNAT) |
| `INPUT` | For NAT packets coming into the system (rarely used) |
| `OUTPUT` | NAT for packets originating from the host itself |
| `POSTROUTING` | NAT after routing is complete (e.g. SNAT/masquerade) |

### Mangle Table (`iptables -t mangle`)
Used for packet modifications, such as TTL, TOS, marking, and QoS.
| Chain | Function |
| --- | --- |
| `PREROUTING` | Before routing |
| `INPUT` | Packets destined for the local system |
| `FORWARD` | Packets forwarded |
| `OUTPUT` | Packets exiting the local system |
| `POSTROUTING` | After routing |

### Raw Table (`iptables -t raw`)
Used to disable connection tracking (conntrack) on certain packets.
| Chain | Function |
| --- | --- |
| `PREROUTING` | Before conntrack is active |
| `OUTPUT` | Packets sent from system before conntrack |

### List of Command Options in iptables
| Option | Full Command | Function / Description |
| --- | --- | --- |
| `-A` | `--append` | Append a rule to the end of the chain |
| `-I` | `--insert` | Insert a rule to a specific position in the chain |
| `-D` | `--delete` | Remove a rule from the chain, by rule number or content |
| `-R` | `--replace` | Replace an existing rule in the chain with a new rule |
| `-L` | `--list` | Display a list of rules in a specific chain (default: all chains) |
| `-F` | `--flush` | Removes all rules from a specific chain (or all chains if not specified) |
| `-Z` | `--zero` | Reset hit counters on all rules |
| `-N` | `--new-chain` | Creates a new custom chain |
| `-X` | `--delete-chain` | Delete a custom chain (must be empty first) |
| `-P` | `--policy` | Set a **default policy** for the chain (`ACCEPT` / `DROP`) |
| `-E` | `--rename-chain` | Rename chain |

Add a rule:
```
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```
Insert the rule in the first order:
```
iptables -I INPUT 1 -p tcp --dport 80 -j DROP
```
Delete a rule based on its content:
```
iptables -D INPUT -p tcp --dport 22 -j ACCEPT
```
Delete rules by number:
```
iptables -D INPUT 3
```
Replace the 2nd rule:
```
iptables -R INPUT 2 -p tcp --dport 443 -j ACCEPT
```
View rules with sequence numbers:
```
iptables -L -v --line-numbers 
```
### Parameters on iptables
| Parameters | Functions |
| --- | --- |
| `-p` / `--protocol` | Specifies the protocol (tcp, udp, icmp, all) |
| `-s` / `--source` | Specifies the source IP or subnet (e.g. `192.168.1.1/24`) |
| `-d` / `--destination` | Specifies the destination IP |
| `-i` / `--in-interface` | Incoming interface (e.g. `eth0`) |
| `-o` / `--out-interface` | Outgoing interface (e.g. `eth1`) |
| `--sport` | Source port (need `-p tcp` or `-p udp`) |
| `--dport` | Destination port (e.g. `--dport 80`) |
| `-m` / `--match` | Specifies the match module (e.g. `state`, `conntrack`, `limit`, etc.) |
| `--state` | Used with `-m state` (e.g. `--state NEW,ESTABLISHED`) |
| `--ctstate` | Used with `-m conntrack` (modern replacement of `--state`) |
| `-j` / `--jump` | Action (target): `ACCEPT`, `DROP`, `REJECT`, `LOG`, `SNAT`, etc |
| `-g` / `-goto` | Jump to another chain (like `-j`, but not back after) |
| `-icmp-type` | Specifies the ICMP type (e.g. `echo-request`) |
| `-m limit` | Used to limit the rate (e.g. `-limit 5/min`) |
| `-m mac` | Matches by MAC address |
| `-mac-source` | Specifies the source MAC address (needs `-m mac`) |
| `-m time` | Limit rule by time/day (needs `time` module) |

Accept TCP connection from 192.168.1.100 to port 22 (SSH):
```
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.100 -j ACCEPT
```
Drop all pings (ICMP requests) to the server:
```
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP
```
Accept the new connection to port 80:
```
iptables -A INPUT -p tcp --dport 80 -m state --state NEW -j ACCEPT
```
### Target (`-j` options)
| Target | Function |
| --- | --- |
| `ACCEPT` | Allow packet |
| `DROP` | Discard packet without response |
| `REJECT` | Discard packet and send response (ICMP/RESET) |
| `LOG` | Log packet information to `syslog` |
| `SNAT` | Source NAT |
| `DNAT` | Destination NAT |
| `MASQUERADE` | Automatic NAT for internet connection sharing |
| `RETURN` | Return to previous chain |

## Preparation
The `iptables` package is usually installed by default on all Linux distros. Check `iptables` with the following command:
```
iptables --version
```
Sample output:
```
iptables v1.8.5 (nf_tables)
```

Then install `iptables-persistent` so that the iptables rules are not lost when the server is rebooted:
```
# Redhat ditribution
dnf install iptables iptables-services
# Debian distribution
apt install iptables iptables-persistent
```

Enable service:

```
# Redhat distribution
systemctl enable --now iptables
systemctl status iptables
# Debian distribution
systemctl enable --now netfilter-persistent
systemctl status netfilter-persistent
```

If using a Redhat derivative, turn off firewalld to avoid conflicts with iptables:
```
systemctl stop firewalld
systemctl disable firewalld
systemctl mask firewalld
```

## Configure iptables
Note that this documentation will configure IPv4 only because IPv6 needs to be configured independently and cannot work with an IPv4 rule.

View the current active rule:
```
iptables -L -n -v
```
Sample output:
```
Chain INPUT (policy ACCEPT 580 packets, 43926 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 819 packets, 65227 bytes)
 pkts bytes target     prot opt in     out     source               destination 
```

Allow Loopback or localhost IP:
```
iptables -A INPUT -i lo -j ACCEPT
```
Allow ping or ICMP:
```
iptables -A INPUT -p icmp -j ACCEPT
```
Allow DNS (53 TCP/UDP):
```
iptables -A INPUT -p tcp -m multiport --destination-ports 53 -j ACCEPT
iptables -A INPUT -p udp -m multiport --destination-ports 53 -j ACCEPT
```
Allow specific ports, for example, allow SSH (22):
```
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```
Allow server access from a specific IP:
```
iptables -A INPUT -s 192.168.1.100 -j ACCEPT
```
Block IP:
```
iptables -A INPUT -s 192.168.1.200 -j DROP
```

Here is a basic iptables firewall:
```
iptables -F
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -i lo -m comment --comment "Allow loopback or localhost" -j ACCEPT
iptables -A INPUT -p icmp -m comment --comment "Allow Ping" -j ACCEPT
iptables -A INPUT -p tcp -m multiport --destination-ports 22,25,53,80,443,465,5222,5269,5280,8999:9003 -j ACCEPT
iptables -A INPUT -p udp -m multiport --destination-ports 53 -j ACCEPT
iptables -P INPUT DROP
iptables -P FORWARD DROP
```

Explanation of the above command:
- Flush/reset all rules in all chains (INPUT, FORWARD, OUTPUT) in the filter table.
- Allow packets that are part of an ESTABLISHED or RELATED connection.
- Allow all connections from interface lo (localhost 127.0.0.1).
- Allow all ICMP packets, e.g. ping (echo-request & echo-reply)
- Using -m multiport for one rule efficiency
- Allow UDP port 53 (DNS)
- All incoming connections and forwarded packets will be blocked by default unless otherwise stated. Using the default DROP option will add a layer of security to
because every port or service on the server must be entered into iptables so that it can be accessed from outside the network.

### Example Scenario iptables
The server can only be accessed via SSH from the office (192.168.100.10), other IPs are rejected
```
iptables -P INPUT DROP
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp -s 192.168.100.10 --dport 22 -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
```
Block IP 172.16.15.14 suspected of brute forcing
```
iptables -A INPUT 1 -s 172.16.15.14 -j DROP
```
Block all access except web (80, 443)
```
iptables -P INPUT DROP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
```
Rate-Limit SSH to avoid Brute Force. Maximum 3 new SSH connections per minute per IP
```
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW \
  -m recent --set
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW \
  -m recent --update --seconds 60 --hitcount 3 -j DROP
```
NAT Forwarding for Gateway
```
# Enable IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# NAT (masquerade) outgoing connections
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Allow forwarding
iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

Important fact: iptables reads rules from top-down matching. Once one rule matches, the action (ACCEPT, DROP, etc.) is immediately executed, and does not continue to the next rule.

There was one case where an IP was suspected of bruteforcing SSH to the server, and after checking iptables it turned out that the default SSH service was auto accepted. This means: all IPs are allowed to access port 22 (SSH).
```
Chain INPUT (policy DROP 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1      245   12K ACCEPT     tcp  --  anywhere       anywhere             tcp dpt:ssh
2        0     0 ACCEPT     all  --  lo     any     anywhere             anywhere             /* Allow loopback or localhost */
3        2   168 ACCEPT     icmp --  any    any     anywhere             anywhere             /* Allow Ping */
```
If you add the DROP rule for that IP after the ACCEPT rule, it will never be run because it has passed the first rule (ACCEPT all IPs for SSH). The solution is is to add the DROP rule above the ACCEPT rule
```
iptables -I INPUT 1 -p tcp -s 192.168.167.12 --dport 22 -j DROP
```
Why `I INPUT 1`?

- `I` means **insert**.
- `1` means inserted as the first **rule** in the `INPUT` chain.
- So iptables will check this rule **before the ACCEPT** rule.

After that, verify:
```
iptables -L INPUT -n --line-numbers
```
Sample output:
```
Chain INPUT (policy DROP 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1        0     0 DROP       tcp  --  any    any     192.168.167.12       anywhere             tcp dpt:ssh
2      245   12K ACCEPT     tcp  --  anywhere       anywhere             tcp dpt:ssh
3        0     0 ACCEPT     all  --  lo     any     anywhere             anywhere             /* Allow loopback or localhost */
4        2   168 ACCEPT     icmp --  any    any     anywhere             anywhere             /* Allow Ping */

```
### Save Changes
iptables does not automatically save changes when we modify the rule, if you forget to save iptables changes, the rule will be lost when rebooted.
Run the following command for the Redhat distribution:
```
service iptables save
```
Sample output:
```
iptables: Saving firewall rules to /etc/sysconfig/iptables:[  OK  ]
```
Run the following command for a Debian distribution:
```
netfilter-persistent save
```
### Log Packet
Log All Packets:
```
iptables -A INPUT -j LOG --log-prefix "DROP INPUT: " --log-level 4
```
Suspicious IP Logs:
```
iptables -A INPUT -s 203.0.113.45 -j LOG --log-prefix "BLOCKED IP: " --log-level 4
```
Log All Incoming Pings:
```
iptables -A INPUT -p icmp --icmp-type echo-request -j LOG --log-prefix "PING REQUEST: " --log-level 4
```

Check the logs if using `syslog` then please check the following:
```
tail -f /var/log/messages
```
For journald-based systems (such as CentOS 7+, AlmaLinux, etc):
```
journalctl | grep "BLOCKED IP:"
```
Or you can use `dmesg`:
```
dmesg | grep "BLOCKED IP"
```
### Remove Rule 
Not only adding rules (`rules`) to allow or block connections, but also needing to remove or reset those rules when the configuration changes or is no longer needed.

Deleting an iptables rule can be done in two main ways:
- By **line number**
- Based on **the rule content itself**

Delete by line number. Check the rule first before deleting:
```
iptables -L -v --line-numbers
```
Sample output:
```
Chain INPUT (policy DROP 1 packets, 304 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1     1435  116K ACCEPT     all  --  any    any     anywhere             anywhere             state RELATED,ESTABLISHED
2        0     0 ACCEPT     all  --  lo     any     anywhere             anywhere             /* Allow loopback or localhost */
3        0     0 ACCEPT     icmp --  any    any     anywhere             anywhere             /* Allow Ping */
```
To delete line number `2` run the following command:
```
iptables -D INPUT 2
```

Delete based on rule contents. Check the rule first:
```
iptables -S
```
Sample output:
```
-P INPUT DROP
-P FORWARD DROP
-P OUTPUT ACCEPT
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -i lo -m comment --comment "Allow loopback or localhost" -j ACCEPT
-A INPUT -p icmp -m comment --comment "Allow Ping" -j ACCEPT
```
Here's to remove the ICMP input:
```
iptables -D INPUT -p icmp -m comment --comment "Allow Ping" -j ACCEPT
```

Delete all rules:
```
iptables -F
```
After deletion, be sure to double-check:
```
iptables -L -n --line-numbers
```
### Policy `iptables -P INPUT DROP` vs `iptables -A INPUT -j DROP`
```
iptables -P INPUT DROP
```
- This sets the **default policy** for the `INPUT` chain.
- This means: **if there is no matching rule**, then **the package will be DROP automatically**.

```
iptables -A INPUT -j DROP
```
- Can be skipped if there is a rule below it (because it does not automatically close all).
- If **putting the `DROP` rule too high**, the ACCEPT rule below it may **never be executed**.

So, which one is safer?
Use `iptables -P INPUT DROP`. This is a best practice in network security. Use the principle: “Default to deny, then explicitly allow.”

