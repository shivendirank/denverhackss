"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface FileItem {
  id: string
  label: string
  type: "2D" | "3D"
  destination: string
}

interface AnimatedFolderProps {
  title: string
  files: FileItem[]
  className?: string
  onFileClick?: (destination: string) => void
}

export function AnimatedFolder({ title, files, className, onFileClick }: AnimatedFolderProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        "p-8 rounded-2xl",
        "bg-zinc-900/50 border border-pink-500/20",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-pink-500/20",
        "hover:border-pink-500/50",
        "group",
        className,
      )}
      style={{
        minWidth: "280px",
        minHeight: "320px",
        perspective: "1000px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at 50% 70%, rgba(255, 182, 217, 0.2) 0%, transparent 70%)",
          opacity: isHovered ? 1 : 0,
        }}
      />

      <div className="relative flex items-center justify-center mb-4" style={{ height: "160px", width: "200px" }}>
        {/* Folder back layer */}
        <div
          className="absolute w-32 h-24 rounded-lg shadow-md"
          style={{
            background: "linear-gradient(135deg, #FF9ED4 0%, #FFB6D9 100%)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
          }}
        />

        {/* Folder tab */}
        <div
          className="absolute w-12 h-4 rounded-t-md"
          style={{
            background: "linear-gradient(135deg, #FF8DC4 0%, #FF9ED4 100%)",
            top: "calc(50% - 48px - 12px)",
            left: "calc(50% - 64px + 16px)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(-25deg) translateY(-2px)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
          }}
        />

        {/* File items */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          {files.slice(0, 2).map((file, index) => (
            <FileCard
              key={file.id}
              file={file}
              delay={index * 100}
              isVisible={isHovered}
              index={index}
              onClick={() => onFileClick?.(file.destination)}
            />
          ))}
        </div>

        {/* Folder front layer */}
        <div
          className="absolute w-32 h-24 rounded-lg shadow-lg"
          style={{
            background: "linear-gradient(135deg, #FFB6D9 0%, #FFC0E0 100%)",
            top: "calc(50% - 48px + 4px)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(25deg) translateY(8px)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 30,
          }}
        />

        {/* Folder shine effect */}
        <div
          className="absolute w-32 h-24 rounded-lg overflow-hidden pointer-events-none"
          style={{
            top: "calc(50% - 48px + 4px)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(25deg) translateY(8px)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 31,
          }}
        />
      </div>

      {/* Folder title */}
      <h3
        className="text-2xl font-black text-white mt-4 transition-all duration-300 uppercase tracking-tight"
        style={{
          transform: isHovered ? "translateY(4px)" : "translateY(0)",
        }}
      >
        {title}
      </h3>

      {/* Hover hint */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-pink-400/60 transition-all duration-300 font-mono"
        style={{
          opacity: isHovered ? 0 : 1,
          transform: isHovered ? "translateY(10px)" : "translateY(0)",
        }}
      >
        <span>Hover to view files →</span>
      </div>
    </div>
  )
}

interface FileCardProps {
  file: FileItem
  delay: number
  isVisible: boolean
  index: number
  onClick: () => void
}

const FileCard = ({ file, delay, isVisible, index, onClick }: FileCardProps) => {
  const [isFileHovered, setIsFileHovered] = useState(false)
  const rotations = [-8, 8]
  const translations = [-45, 45]

  const is2D = file.type === "2D"
  const is3D = file.type === "3D"

  return (
    <div
      className={cn(
        "absolute w-24 h-32 rounded-lg overflow-hidden shadow-xl cursor-pointer",
        "border-2 transition-all duration-300",
        isFileHovered ? "border-pink-400 scale-110" : "border-pink-500/30",
      )}
      style={{
        background: is2D
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #0f3460 0%, #16213e 100%)",
        transform: isVisible
          ? `translateY(-100px) translateX(${translations[index]}px) rotate(${rotations[index]}deg) scale(1)`
          : "translateY(0px) translateX(0px) rotate(0deg) scale(0.5)",
        opacity: isVisible ? 1 : 0,
        transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
        zIndex: isFileHovered ? 20 : 10 - index,
        left: "-48px",
        top: "-64px",
      }}
      onMouseEnter={() => setIsFileHovered(true)}
      onMouseLeave={() => setIsFileHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {/* File icon background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {is2D ? (
          <svg className="w-12 h-12 text-pink-300/30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-pink-300/30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L6.04 7.5 12 10.85l5.96-3.35L12 4.15zM5 15.91l6 3.38v-6.71L5 9.21v6.7zm14 0v-6.7l-6 3.37v6.71l6-3.38z" />
          </svg>
        )}
      </div>

      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isFileHovered ? "opacity-100" : "opacity-70",
        )}
        style={{
          background: is2D
            ? "linear-gradient(135deg, rgba(255, 182, 217, 0.2) 0%, transparent 100%)"
            : "linear-gradient(135deg, rgba(159, 122, 234, 0.2) 0%, transparent 100%)",
        }}
      />

      {/* File type badge */}
      <div
        className={cn(
          "absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-black",
          is2D ? "bg-pink-500 text-white" : "bg-purple-500 text-white",
        )}
      >
        {file.type}
      </div>

      {/* File label */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
        <p className="text-xs font-bold text-white truncate">{file.label}</p>
        <p className="text-[9px] text-white/50 uppercase tracking-wider">{file.type} File</p>
      </div>

      {/* Hover shine effect */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
          opacity: isFileHovered ? 1 : 0,
        }}
      />
    </div>
  )
}