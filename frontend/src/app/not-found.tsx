'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, BookOpen, Users, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-slate-800 dark:to-neutral-900 px-4">
      <motion.div
        className="text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 text-blue-200 dark:text-blue-800 opacity-20"
            animate={floatingAnimation}
          >
            <BookOpen size={48} />
          </motion.div>
          <motion.div
            className="absolute top-40 right-20 text-purple-200 dark:text-purple-800 opacity-20"
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
          >
            <Users size={36} />
          </motion.div>
          <motion.div
            className="absolute bottom-40 left-20 text-green-200 dark:text-green-800 opacity-20"
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
          >
            <MessageCircle size={42} />
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div variants={itemVariants} className="relative z-10">
          {/* 404 Number */}
          <motion.div
            className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
              transition: {
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            404
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Oops! Page Not Found
          </h1>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            The page you&apos;re looking for seems to have wandered off into the digital wilderness. 
            Don&apos;t worry though - even the best tutors sometimes take a wrong turn!
          </p>
        </motion.div>

        {/* Illustration */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center shadow-lg"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <Search className="w-16 h-16 text-blue-500 dark:text-blue-400" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              animate={{
                y: [-5, 5, -5],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <span className="text-yellow-800 text-sm font-bold">?</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Homepage
          </Button>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div variants={itemVariants}>
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            <p className="mb-4">Or try these popular sections:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="/dashboard"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.a>
              <motion.a
                href="/tutors"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-300 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Find Tutors
              </motion.a>
              <motion.a
                href="/courses"
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-300 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Courses
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Fun Quote */}
        <motion.div
          variants={itemVariants}
          className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto"
        >
          <p className="text-gray-700 dark:text-gray-300 italic">
            The best teachers are those who show you where to look, but don&apos;t tell you what to see.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            — Alexandra K. Trenfor
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
