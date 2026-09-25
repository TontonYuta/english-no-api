#!/usr/bin/env bash
# ==============================================================================
# Build Debian Package (.deb) for PlayEng Studio
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PKG_NAME="playeng-studio"
PKG_VERSION="1.0.0"
PKG_ARCH="amd64"
DEB_NAME="${PKG_NAME}_${PKG_VERSION}_${PKG_ARCH}.deb"
OUTPUT_DIR="$REPO_DIR/dist-deb"
STAGING_DIR="/tmp/${PKG_NAME}-deb-build-$"

echo "======================================================================"
echo "[PlayEng Studio] Building Debian package: $DEB_NAME"
echo "======================================================================"

if ! which dpkg-deb >/dev/null 2>&1; then
    echo "[PlayEng Studio] Error: dpkg-deb command not found. Please install dpkg." >&2
    exit 1
fi

# 1. Clean previous build staging
rm -rf "$STAGING_DIR" "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 2. Build frontend and server bundle
echo "[1/6] Building production bundle..."
cd "$REPO_DIR"
npm run build

# 3. Create debian packaging directory tree
echo "[2/6] Preparing debian directory structure..."
mkdir -p "$STAGING_DIR/DEBIAN"
mkdir -p "$STAGING_DIR/opt/$PKG_NAME/dist"
mkdir -p "$STAGING_DIR/opt/$PKG_NAME/scripts"
mkdir -p "$STAGING_DIR/opt/$PKG_NAME/public"
mkdir -p "$STAGING_DIR/usr/bin"
mkdir -p "$STAGING_DIR/usr/share/applications"
mkdir -p "$STAGING_DIR/usr/share/icons/hicolor/512x512/apps"
mkdir -p "$STAGING_DIR/usr/share/icons/hicolor/scalable/apps"

# 4. Copy app files
echo "[3/6] Copying app bundles and assets..."
cp -r "$REPO_DIR/dist/." "$STAGING_DIR/opt/$PKG_NAME/dist/"
cp "$REPO_DIR/package.json" "$STAGING_DIR/opt/$PKG_NAME/package.json"
cp "$REPO_DIR/scripts/playeng-studio" "$STAGING_DIR/opt/$PKG_NAME/scripts/playeng-studio"
chmod +x "$STAGING_DIR/opt/$PKG_NAME/scripts/playeng-studio"

if [ -f "$REPO_DIR/public/playeng-studio.png" ]; then
    cp "$REPO_DIR/public/playeng-studio.png" "$STAGING_DIR/opt/$PKG_NAME/public/playeng-studio.png"
    cp "$REPO_DIR/public/playeng-studio.png" "$STAGING_DIR/usr/share/icons/hicolor/512x512/apps/playeng-studio.png"
fi

if [ -f "$REPO_DIR/public/favicon.svg" ]; then
    cp "$REPO_DIR/public/favicon.svg" "$STAGING_DIR/opt/$PKG_NAME/public/favicon.svg"
    cp "$REPO_DIR/public/favicon.svg" "$STAGING_DIR/usr/share/icons/hicolor/scalable/apps/playeng-studio.svg"
fi

# Symlink launcher to /usr/bin/playeng-studio
ln -sf "/opt/$PKG_NAME/scripts/playeng-studio" "$STAGING_DIR/usr/bin/playeng-studio"

# Copy desktop launcher
cp "$REPO_DIR/scripts/playeng-studio.desktop" "$STAGING_DIR/usr/share/applications/playeng-studio.desktop"

# 5. Install production dependencies in /opt/playeng-studio
echo "[4/6] Installing production dependencies in /opt/$PKG_NAME..."
cp "$REPO_DIR/package-lock.json" "$STAGING_DIR/opt/$PKG_NAME/package-lock.json"
(
    cd "$STAGING_DIR/opt/$PKG_NAME"
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund
    rm -f package-lock.json
)

# 6. Generate DEBIAN control, postinst, postrm
echo "[5/6] Generating Debian package control files..."

INSTALLED_SIZE=$(du -sk "$STAGING_DIR" | cut -f1)

cat <<EOF > "$STAGING_DIR/DEBIAN/control"
Package: $PKG_NAME
Version: $PKG_VERSION
Architecture: $PKG_ARCH
Maintainer: TontonYuta <huyhoang6altt@gmail.com>
Installed-Size: $INSTALLED_SIZE
Depends: nodejs (>= 18.0.0), curl, lsof
Recommends: google-chrome-stable | chromium-browser | chromium
Section: education
Priority: optional
Homepage: https://github.com/TontonYuta/english-no-api
Description: PlayEng Studio - AI English Learning Studio
 Smart AI English Learning Studio automated via Playwright (No API Key Required).
 Features interactive reading comprehension, vocabulary mastery, bilingual translation,
 speech pronunciation evaluation, and mobile remote control companion.
EOF

cat <<'EOF' > "$STAGING_DIR/DEBIAN/postinst"
#!/bin/sh
set -e

if [ -x /usr/bin/update-desktop-database ]; then
    update-desktop-database -q /usr/share/applications || true
fi

if [ -x /usr/bin/gtk-update-icon-cache ]; then
    gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi

exit 0
EOF
chmod 755 "$STAGING_DIR/DEBIAN/postinst"

cat <<'EOF' > "$STAGING_DIR/DEBIAN/postrm"
#!/bin/sh
set -e

if [ "$1" = "remove" ] || [ "$1" = "purge" ]; then
    if [ -x /usr/bin/update-desktop-database ]; then
        update-desktop-database -q /usr/share/applications || true
    fi

    if [ -x /usr/bin/gtk-update-icon-cache ]; then
        gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
    fi
fi

exit 0
EOF
chmod 755 "$STAGING_DIR/DEBIAN/postrm"

# Permissions normalization
find "$STAGING_DIR" -type d -exec chmod 755 {} +
find "$STAGING_DIR/opt/$PKG_NAME" -type f -exec chmod 644 {} +
chmod 755 "$STAGING_DIR/opt/$PKG_NAME/scripts/playeng-studio"
find "$STAGING_DIR/opt/$PKG_NAME/node_modules/.bin" -type f -exec chmod 755 {} + 2>/dev/null || true
chmod 644 "$STAGING_DIR/usr/share/applications/playeng-studio.desktop"
chmod 755 "$STAGING_DIR/DEBIAN/postinst" "$STAGING_DIR/DEBIAN/postrm"

# 7. Package with dpkg-deb
echo "[6/6] Packaging into $OUTPUT_DIR/$DEB_NAME..."
dpkg-deb --build --root-owner-group "$STAGING_DIR" "$OUTPUT_DIR/$DEB_NAME"

# 8. Clean temporary staging
rm -rf "$STAGING_DIR"

# 9. Verify package
echo "======================================================================"
echo "[PlayEng Studio] Debian Package Summary:"
dpkg-deb -I "$OUTPUT_DIR/$DEB_NAME"
echo "----------------------------------------------------------------------"
ls -lh "$OUTPUT_DIR/$DEB_NAME"
sha256sum "$OUTPUT_DIR/$DEB_NAME"
echo "======================================================================"
echo "[PlayEng Studio] Successfully built $OUTPUT_DIR/$DEB_NAME"
