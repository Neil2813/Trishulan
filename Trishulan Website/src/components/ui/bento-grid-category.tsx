"use client"
import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"

function CategoryCard({ 
  title, 
  description, 
  listings, 
  className,
  bgClass,
  imagePath,
  imageClassName = ""
}: any) {
  return (
    <motion.div
      className={`relative rounded-xl p-5 md:p-6 flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer overflow-hidden group ${bgClass} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10 w-full sm:w-[70%] md:w-[60%] lg:w-[65%]">
        <h3 className="font-bold text-[18px] md:text-[22px] text-[#0A1629] leading-tight mb-2">{title}</h3>
        <p className="text-[#64748B] text-[12px] md:text-[14px] leading-snug">{description}</p>
      </div>
      
      <div className="relative z-10 mt-6">
        <span className="text-[#64748B] text-[12px] md:text-[13px] font-medium flex items-center gap-2 group-hover:text-[#0A1629] transition-colors">
          {listings} 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </span>
      </div>

      {imagePath && (
        <div className="absolute inset-0 pointer-events-none">
          <Image 
            src={imagePath} 
            alt={title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover ${imageClassName || "object-center"}`} 
          />
        </div>
      )}
    </motion.div>
  )
}

function CategoryBentoGrid() {
  return (
    <section className="bg-white px-6 py-12 md:py-20">
      <motion.div 
        className="max-w-[1400px] w-full mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        
        <motion.div 
          className="flex items-end justify-between mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-[32px] md:text-[40px] font-black text-[#0A1629] tracking-tight">Browse by category</h2>
            <p className="text-[#64748B] mt-1 text-[14px] md:text-[16px]">Everything a factory buys, in one place.</p>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 auto-rows-[160px] md:auto-rows-[180px] lg:auto-rows-[200px]">
          
          <CategoryCard
            title="Raw Materials"
            description="Industrial chemicals, polymers & metals."
            listings="480+ listings"
            bgClass="bg-[#EFF7ED]"
            imagePath="/Bento Box/RawMaterial.png"
            imageClassName="object-right-bottom"
            className="md:col-span-2 md:row-span-2"
          />

          <CategoryCard
            title="Machinery"
            description="New, used & refurbished machines."
            listings="400+ listings"
            bgClass="bg-[#EFF4FF]"
            imagePath="/Bento Box/Machinery.png"
            imageClassName="object-right-bottom"
            className="md:col-span-2"
          />

          <CategoryCard
            title="Spares & Parts"
            description="OEM-grade spares, ready to ship."
            listings="400+ listings"
            bgClass="bg-[#FDF4EB]"
            imagePath="/Bento Box/SpareAndParts.png"
            imageClassName="object-right-bottom"
            className="md:col-span-2 md:row-span-2"
          />

          <CategoryCard
            title="Transport & Logistics"
            description="FTL, PTL & container freight."
            listings="320+ listings"
            bgClass="bg-[#FCF5EF]"
            imagePath="/Bento Box/LogisticsAndTransportation.png"
            imageClassName="object-right-bottom"
            className="md:col-span-2"
          />

          <CategoryCard
            title="Workforce & Training"
            description="Skilled industrial workers and certification."
            listings="720+ listings"
            bgClass="bg-[#F3EFFF]"
            imagePath="/Bento Box/WorkforceAndTraining.png"
            imageClassName="object-right-bottom"
            className="md:col-span-3"
          />

          <CategoryCard
            title="Business Services"
            description="Company registration, Trademark, and Insurance."
            listings="920+ listings"
            bgClass="bg-[#EBF7F2]"
            imagePath="/Bento Box/BusinessServices.png"
            imageClassName="object-right-bottom"
            className="md:col-span-3"
          />

        </div>
      </motion.div>
    </section>
  )
}

export default function BentoGridCategory() {
  return <CategoryBentoGrid />
}
