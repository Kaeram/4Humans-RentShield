import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
}

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
}

export default function Layout({ children }) {
    const location = useLocation()

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    )
}
