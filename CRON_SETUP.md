# Questlog Cron Job Setup

## Daily Reset at 6:00 AM

To set up automatic daily reset at 6:00 AM, add the following cron job:

```bash
# Edit crontab
crontab -e

# Add this line for daily reset at 6:00 AM
0 6 * * * /home/miromursa/questlog/scripts/daily-reset.sh http://localhost:3000/api/reset >> /home/miromursa/questlog/logs/reset.log 2>&1
```

## Alternative: Using system service

Create a systemd service for more reliable scheduling:

```ini
# /etc/systemd/system/questlog-reset.service
[Unit]
Description=Questlog Daily Reset
After=network.target

[Service]
Type=oneshot
ExecStart=/home/miromursa/questlog/scripts/daily-reset.sh http://localhost:3000/api/reset
User=miromursa
Group=miromursa

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/questlog-reset.timer
[Unit]
Description=Run Questlog daily reset at 6:00 AM
Requires=questlog-reset.service

[Timer]
OnCalendar=*-*-* 06:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable the timer:
```bash
sudo systemctl enable questlog-reset.timer
sudo systemctl start questlog-reset.timer
```

## Manual Testing

Test the reset manually:
```bash
./scripts/daily-reset.sh http://localhost:3000/api/reset
```

Or call the API directly:
```bash
curl -X POST http://localhost:3000/api/reset
```
