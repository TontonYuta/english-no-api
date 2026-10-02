#!/usr/bin/env bash
# ==============================================================================
# Install PlayEng Studio Desktop Launcher on Linux
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons"

mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR"

echo "[PlayEng Studio] Installing launcher script..."
cp "$SCRIPT_DIR/playeng-studio" "$BIN_DIR/playeng-studio"
chmod +x "$BIN_DIR/playeng-studio"

# Copy app icon if available
if [ -f "$REPO_DIR/public/playeng-studio.png" ]; then
    cp "$REPO_DIR/public/playeng-studio.png" "$ICON_DIR/playeng-studio.png"
fi
if [ -f "$REPO_DIR/public/favicon.svg" ]; then
    cp "$REPO_DIR/public/favicon.svg" "$ICON_DIR/playeng-studio.svg"
fi

echo "[PlayEng Studio] Installing desktop entry..."
cp "$SCRIPT_DIR/playeng-studio.desktop" "$DESKTOP_DIR/playeng-studio.desktop"

# Sync with /opt/playeng-studio and /usr if available
if [ -d "/opt/playeng-studio" ]; then
    if sudo -n true 2>/dev/null; then
        echo "[PlayEng Studio] Syncing to /opt/playeng-studio and /usr/share..."
        sudo cp "$SCRIPT_DIR/playeng-studio" /opt/playeng-studio/scripts/playeng-studio
        sudo chmod +x /opt/playeng-studio/scripts/playeng-studio
        sudo cp -r "$REPO_DIR/dist"/* /opt/playeng-studio/dist/
        sudo cp "$SCRIPT_DIR/playeng-studio.desktop" /usr/share/applications/playeng-studio.desktop 2>/dev/null || true
    fi
fi

if which update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" || true
    sudo -n update-desktop-database /usr/share/applications 2>/dev/null || true
fi

echo "[PlayEng Studio] Installation complete! You can now launch PlayEng Studio from your app menu."
