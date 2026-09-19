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
if [ -f "$REPO_DIR/public/favicon.svg" ] && [ ! -f "$ICON_DIR/playeng-studio.png" ]; then
    cp "$REPO_DIR/public/favicon.svg" "$ICON_DIR/playeng-studio.svg"
fi

echo "[PlayEng Studio] Installing desktop entry..."
sed "s|/home/tontonyuta/english-no-api|$REPO_DIR|g" "$SCRIPT_DIR/playeng-studio.desktop" > "$DESKTOP_DIR/playeng-studio.desktop"

if which update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" || true
fi

echo "[PlayEng Studio] Installation complete! You can now launch PlayEng Studio from your app menu."
