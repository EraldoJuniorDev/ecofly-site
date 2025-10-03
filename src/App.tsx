import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './lib/theme-provider'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BackToTop from './components/layout/BackToTop'
import Home from './pages/Home'
import Store from './pages/Store'
import Feedback from './pages/Feedback'
import Favorites from './pages/Favorites'
import Contact from './pages/Contact'
import { Toaster } from './components/ui/sonner'

console.log('App component loading...')

function App() {
  console.log('App component rendered')
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="ecofly-ui-theme">
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/loja" element={<Store />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/contato" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
          <BackToTop />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App