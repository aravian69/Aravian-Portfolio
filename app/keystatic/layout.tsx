// The Keystatic admin renders its own full-page UI, so this layout stays bare
// (no site nav/footer/cursor). The root layout still provides <html>/<body>.
export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return children;
}
