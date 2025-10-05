export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>Hello World! 👋</h1>
      <p style={{ fontSize: '1.5rem', color: '#666' }}>
        WGMN Website is Live
      </p>
    </main>
  )
}
