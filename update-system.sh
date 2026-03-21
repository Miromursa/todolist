#!/bin/bash

echo "Updating system packages..."
sudo apt update

echo "Upgrading installed packages..."
sudo apt upgrade -y

echo "Removing unnecessary packages..."
sudo apt autoremove -y

echo "Cleaning package cache..."
sudo apt autoclean

echo "System update completed!"
