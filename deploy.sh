#!/bin/bash

cd /var/www/zarkha/admin || exit

echo "Pulling latest code..."
git pull origin main

echo "Restarting app..."
pm2 restart admin-app

echo "Deployment done!"
