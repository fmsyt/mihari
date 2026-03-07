pkgname=mihari
pkgver=1.0.6
pkgrel=1
pkgdesc="Mihari desktop application"
arch=('x86_64')
license=('MIT')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup3' 'pango' 'webkit2gtk-4.1')

_release_dir="src-tauri/target/release"

package() {
  install -Dm755 "${startdir}/${_release_dir}/${pkgname}" "${pkgdir}/usr/bin/${pkgname}"

  install -Dm644 "${startdir}/src-tauri/icons/128x128.png" \
    "${pkgdir}/usr/share/icons/hicolor/128x128/apps/${pkgname}.png"
}
