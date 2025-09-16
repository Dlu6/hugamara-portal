# Asterisk Realtime Dialplan, WebRTC (DTLS-SRTP), and CDR (Adaptive ODBC)

This document captures the working configuration for:

- Realtime dialplan backed by MariaDB via ODBC
- WebRTC media using DTLS-SRTP
- Asterisk CDR written via Adaptive ODBC to the `cdr` table

## Realtime Dialplan (ODBC)

1. Map the dialplan family to ODBC

`/etc/asterisk/extconfig.conf`

```
[settings]
extensions => odbc,asterisk,voice_extensions
```

- `asterisk` is the DSN section in `res_odbc.conf`
- `voice_extensions` is the table name

2. Switch contexts to Realtime

`/etc/asterisk/extensions_mayday_context.conf`

```
[from-voip-provider]
switch => Realtime/from-voip-provider@voice_extensions

[outbound-trunk]
switch => Realtime/outbound-trunk@voice_extensions

[internal]
switch => Realtime/internal@voice_extensions
include => outbound-trunk

[from-internal]
switch => Realtime/from-internal@voice_extensions
include => internal
```

Include this file from `extensions.conf`:

```
#include extensions_mayday_context.conf
```

3. Database schema for realtime

`voice_extensions` must have the column `exten`. If your app model stores
`extension`, create a generated column:

```
ALTER TABLE voice_extensions
  ADD COLUMN exten VARCHAR(255)
  GENERATED ALWAYS AS (extension) STORED;
```

Recommended index:

```
CREATE INDEX idx_voice_ext_ex_ctx_pri
  ON voice_extensions(exten, context, priority);
```

Ensure you have a matching pattern in `from-internal` with contiguous priorities:

```
INSERT INTO voice_extensions (extension, context, priority, app, appdata, type, isGenerated, outboundRouteId)
VALUES ('_.', 'from-internal', 1, 'Set', 'CDR(type)=outbound', 'outbound', 1, 1),
       ('_.', 'from-internal', 2, 'Set', 'CDR(destination)=${EXTEN}', 'outbound', 1, 1),
       ('_.', 'from-internal', 3, 'Dial', 'PJSIP/${EXTEN}@Hugamara_Trunk', 'outbound', 1, 1),
       ('_.', 'from-internal', 4, 'Set', 'CALLERID(all)="0323300243 <0323300243>"', 'outbound', 1, 1);
```

## WebRTC (DTLS-SRTP)

Asterisk must have SRTP support (module `res_srtp.so`) and PJSIP DTLS configured.

1. Install/build SRTP support (Debian 12)

- Install deps: `apt-get install -y libsrtp2-1 libsrtp2-dev libssl-dev`
- If building Asterisk: `./configure --with-ssl --with-srtp && make menuselect` (enable `res_srtp`)
- `make && make install && ldconfig`

2. Verify module

```
asterisk -rx "module show like srtp"
```

Expect: `res_srtp.so` Running

3. PJSIP WebRTC endpoint essentials

- `media_encryption=dtls`
- `webrtc=yes` (or equivalent settings)
- `dtls_auto_generate_cert=yes` (or provide cert/key)

Useful checks:

```
pjsip show endpoint <id> | grep -i encryption
```

## CDR via Adaptive ODBC

We use Adaptive ODBC as the single CDR backend to write into the `cdr` table.

1. Enable Adaptive, disable cdr_odbc

`/etc/asterisk/modules.conf`

```
[modules]
autoload=yes
noload => cdr_odbc.so
load => cdr_adaptive_odbc.so
```

2. DSN connection

`/etc/asterisk/res_odbc.conf`

```
[asterisk]
dsn=asterisk
username=YOUR_USER
password=YOUR_PASS
pooling=yes
limit=20
```

3. Adaptive CDR config

`/etc/asterisk/cdr_adaptive_odbc.conf`

```
[asterisk]
connection=asterisk
table=cdr
usegmtime=no
loguniqueid=yes
```

4. cdr table schema

The table should include (sample working layout):

```
id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
start       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
answer      DATETIME NULL,
end         DATETIME NULL,
clid        VARCHAR(80) NOT NULL DEFAULT '',
src         VARCHAR(80) NOT NULL DEFAULT '',
dst         VARCHAR(80) NOT NULL DEFAULT '',
dcontext    VARCHAR(80) NOT NULL DEFAULT '',
channel     VARCHAR(80) NOT NULL DEFAULT '',
dstchannel  VARCHAR(80) NULL,
lastapp     VARCHAR(80) NOT NULL DEFAULT '',
lastdata    VARCHAR(80) NOT NULL DEFAULT '',
duration    INT NOT NULL DEFAULT 0,
billsec     INT NOT NULL DEFAULT 0,
disposition VARCHAR(45) NOT NULL DEFAULT '',
amaflags    INT NOT NULL DEFAULT 0,
accountcode VARCHAR(20) NOT NULL DEFAULT '',
uniqueid    VARCHAR(32) NOT NULL DEFAULT '',
userfield   VARCHAR(255) NULL
```

5. Verify and test

```
asterisk -rx "module show like cdr"
asterisk -rx "cdr show status"
asterisk -rx "odbc show"
```

Place a call, then:

```
mysql -e "USE asterisk; SELECT id,start,src,dst,disposition,uniqueid FROM cdr ORDER BY id DESC LIMIT 10;"
```

## Troubleshooting Quick Notes

- "extension not found in context" → missing `(exten, context, priority=1)` row.
- ODBC prepare error "Unknown column 'exten'" → add STORED GENERATED `exten`.
- WebRTC DTLS/SRTP errors → load `res_srtp.so`, ensure `media_encryption=dtls`.
- CDR insert fails with calldate → use Adaptive ODBC or add `calldate` generated from `start`.

## SIP Packet Analysis with sngrep (Debian 12)

`sngrep` is a terminal UI tool to trace SIP signaling (very helpful to debug outbound trunk issues, CLI policies, number formats, 403/404/503 causes, etc.).

### A. Install (try repository first)

```bash
sudo apt update
sudo apt install -y sngrep || true   # if available in your mirror
```

If the package is not found, build from source:

### B. Build from source

```bash
# 1) Build dependencies
sudo apt update
sudo apt install -y git autoconf automake gcc make \
  libncurses5-dev libpcap-dev pkg-config libssl-dev libpcre2-dev

# 2) Fetch and build
cd /usr/src
sudo git clone https://github.com/irontec/sngrep.git
cd sngrep
sudo ./bootstrap.sh   # or ./autogen.sh if bootstrap.sh is not present
sudo ./configure --with-openssl
sudo make -j"$(nproc)"
sudo make install

# 3) Verify
sngrep -V
which sngrep
```

### C. Common capture commands

Run with sudo (requires raw socket access):

```bash
# All SIP on default ports (UDP/TCP/TLS 5060/5061), any interface
sudo sngrep -d any port 5060 or port 5061

# Focus on your provider IP (replace PROVIDER_IP)
sudo sngrep -d any host PROVIDER_IP

# If your trunk uses a custom port (e.g., 5080)
sudo sngrep -d any port 5080

# Save a capture to PCAP from within sngrep (F5), or non-interactive via tcpdump then inspect:
sudo tcpdump -i any -w /tmp/sip.pcap udp port 5060 or tcp port 5061
sngrep -I /tmp/sip.pcap
```

Tips:

- Use arrow keys/Enter to open a dialog and view the full SIP ladder.
- Press `/` or `F2` to filter; `q` to quit.
- For WebRTC/WSS signaling (SIP over WebSocket), rely on `pjsip set logger on` in Asterisk and browser console logs; `sngrep` won’t decode WS frames.

## Application Model Notes

- `mayday/slave-backend/models/cdr.js` matches Adaptive ODBC fields; treat this table as read‑only from the app.
- `mayday/slave-backend/models/voiceExtensionModel.js` uses a virtual `exten` that mirrors `extension` for ORM use; realtime uses physical `exten` (generated column) in DB.
