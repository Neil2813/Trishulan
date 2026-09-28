"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-66px)] flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/LandingPage.png')] bg-cover bg-right bg-no-repeat"></div>
        {/* Gradient overlay to make text readable on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent w-full md:w-[75%] lg:w-[65%]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-[20px] sm:px-[40px] md:px-[60px] lg:px-[80px] pt-[60px] pb-[60px] md:pt-[100px] md:pb-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px] lg:gap-[60px]">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-11 xl:col-span-10 flex flex-col justify-center"
          >

            {/* Top Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-[16px] inline-block"
            >
              <span className="text-[14px] md:text-[16px] leading-[1] font-bold text-[#0A7B3E] tracking-[0.2em] uppercase">
                TRISHULAN
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[36px] sm:text-[42px] md:text-[56px] lg:text-[72px] xl:text-[80px] leading-[1.05] font-black text-[#0F172A] mb-[24px] tracking-tight whitespace-nowrap"
            >
              SOURCE, SELL & GROW <br />
              <span className="text-[#0A7B3E]">ON ONE PLATFORM</span>
            </motion.h1>

            {/* Lede */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-[18px] md:text-[20px] text-[#334155] leading-[1.6] max-w-[560px] mb-[48px]"
            >
              Raw materials, machinery, logistics and services from 25,000+ verified sellers, with live market prices to keep every deal fair.
            </motion.p>

            {/* Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] max-w-[700px]"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/buy" className="block h-full bg-emerald-50/90 hover:bg-emerald-100 border-2 border-emerald-500/30 text-emerald-950 p-[28px] md:p-[32px] rounded-[20px] relative overflow-hidden group transition-all shadow-md hover:shadow-xl">
                  <div className="text-[11px] font-extrabold tracking-[0.15em] text-[#0A7B3E] mb-[12px] uppercase">I'M BUYING</div>
                  <h3 className="text-[24px] font-extrabold text-[#0A7B3E] mb-[4px]">Find suppliers</h3>
                  <p className="text-[14px] text-emerald-800/90 font-medium">Compare quotes from verified sellers.</p>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/sell" className="block h-full bg-orange-50/90 hover:bg-orange-100 border-2 border-orange-500/30 text-orange-950 p-[28px] md:p-[32px] rounded-[20px] relative overflow-hidden group transition-all shadow-md hover:shadow-xl">
                  <div className="text-[11px] font-extrabold tracking-[0.15em] text-[#EA580C] mb-[12px] uppercase">I'M SELLING</div>
                  <h3 className="text-[24px] font-extrabold text-[#EA580C] mb-[4px]">Reach buyers</h3>
                  <p className="text-[14px] text-orange-900/90 font-medium">List products and grow your reach.</p>
                </Link>
              </motion.div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}

