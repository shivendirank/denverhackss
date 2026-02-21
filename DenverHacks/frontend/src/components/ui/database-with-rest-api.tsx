"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Database, Send, Sparkles } from "lucide-react";

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
};

export const DatabaseWithRestApi = ({
  title = "AI Agent Trust Layer",
  lightColor = "#FFB6D9",
  circleText = "Decentralized Attestation Network",
  badgeTexts = ["TEE Verification", "X402 Payments", "FHE Compute", "Reputation Score"],
  buttonTexts = ["Register Agent", "Execute Task", "Verify Proof"],
}: {
  title?: string;
  lightColor?: string;
  circleText?: string;
  badgeTexts?: string[];
  buttonTexts?: string[];
}) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 py-12 text-zinc-50">
      <div className="relative">
        <h1 className="z-10 mb-12 max-w-4xl text-center text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <DatabaseAnimation
          lightColor={lightColor}
          circleText={circleText}
          badgeTexts={badgeTexts}
          buttonTexts={buttonTexts}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </div>
  );
};

const DatabaseAnimation = ({
  lightColor,
  circleText,
  badgeTexts,
  buttonTexts,
  selected,
  setSelected,
}: {
  lightColor: string;
  circleText: string;
  badgeTexts: string[];
  buttonTexts: string[];
  selected: number | null;
  setSelected: (val: number | null) => void;
}) => {
  return (
    <div className="relative mx-auto h-fit w-fit">
      <svg
        width="812"
        height="542"
        viewBox="0 0 812 542"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="database"
      >
        {/* Database cylinder */}
        <g id="db">
          <ellipse
            id="Ellipse 2"
            cx="406"
            cy="483.5"
            rx="324"
            ry="58.5"
            fill="#27272A"
          />
          <path
            id="Rectangle 1"
            d="M82 483.5V191.5C82 133.608 222.162 86.5 406 86.5C589.838 86.5 730 133.608 730 191.5V483.5"
            fill="#27272A"
          />
          <ellipse
            id="Ellipse 1"
            cx="406"
            cy="191.5"
            rx="324"
            ry="105"
            fill="#3F3F46"
          />
        </g>

        {/* Animated lights around cylinder */}
        <ellipse
          id="Ellipse 3"
          className="db-light-1"
          cx="406"
          cy="191.5"
          rx="4"
          ry="4"
          fill={lightColor}
          style={{ "--light-color": lightColor } as React.CSSProperties}
        />
        <ellipse
          id="Ellipse 4"
          className="db-light-2"
          cx="406"
          cy="191.5"
          rx="4"
          ry="4"
          fill={lightColor}
          style={{ "--light-color": lightColor } as React.CSSProperties}
        />
        <ellipse
          id="Ellipse 5"
          className="db-light-3"
          cx="406"
          cy="191.5"
          rx="4"
          ry="4"
          fill={lightColor}
          style={{ "--light-color": lightColor } as React.CSSProperties}
        />
        <ellipse
          id="Ellipse 6"
          className="db-light-4"
          cx="406"
          cy="191.5"
          rx="4"
          ry="4"
          fill={lightColor}
          style={{ "--light-color": lightColor } as React.CSSProperties}
        />
      </svg>

      {/* Center floating circle */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -12, 0] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        style={{
          boxShadow: `0px 0px 24px ${lightColor}`,
        }}
        className="absolute left-1/2 top-[25%] z-10 grid size-32 -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full border border-zinc-700 bg-zinc-800 text-3xl"
      >
        <Sparkles className="text-pink-300" />
      </motion.div>

      {/* Circle text badge */}
      <div className="absolute left-1/2 top-[25%] z-0 -translate-x-1/2 -translate-y-1/2">
        <div className="size-[450px] rounded-full border border-dashed border-zinc-700">
          <div className="relative size-full animate-[spin_40s_linear_infinite]">
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-light uppercase"
              style={{
                boxShadow: `0px 0px 24px ${lightColor}`,
              }}
            >
              {circleText}
            </span>
          </div>
        </div>
      </div>

      {/* Badges positioned around the circle */}
      <Badges
        lightColor={lightColor}
        badgeTexts={badgeTexts}
        selected={selected}
      />

      {/* Action buttons */}
      <ActionButtons
        lightColor={lightColor}
        buttonTexts={buttonTexts}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
};

const Badges = ({
  lightColor,
  badgeTexts,
  selected,
}: {
  lightColor: string;
  badgeTexts: string[];
  selected: number | null;
}) => {
  return (
    <>
      {badgeTexts.map((text, idx) => (
        <Badge
          key={idx}
          lightColor={lightColor}
          className={`absolute left-[${
            15 + (idx % 2) * 70
          }%] top-[${30 + Math.floor(idx / 2) * 25}%]`}
          selected={selected === idx}
        >
          {text}
        </Badge>
      ))}
    </>
  );
};

const Badge = ({
  children,
  lightColor,
  className,
  selected,
}: {
  children: string;
  lightColor: string;
  className: string;
  selected: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        boxShadow: selected ? `0px 0px 24px ${lightColor}` : "",
      }}
      className={`${className} z-20 w-fit rounded-xl border border-zinc-700 bg-zinc-900/75 px-3 py-1.5 text-xs backdrop-blur-sm transition-all`}
    >
      <div className="flex items-center gap-1.5">
        {selected && <Check className="size-3 text-pink-300" />}
        <span className="block">{children}</span>
      </div>
    </motion.div>
  );
};

const ActionButtons = ({
  lightColor,
  buttonTexts,
  selected,
  setSelected,
}: {
  lightColor: string;
  buttonTexts: string[];
  selected: number | null;
  setSelected: (val: number | null) => void;
}) => {
  return (
    <div className="absolute -bottom-24 left-1/2 flex -translate-x-1/2 gap-2">
      {buttonTexts.map((text, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelected(idx)}
          style={{
            boxShadow:
              selected === idx ? `0px 0px 24px ${lightColor}` : "none",
          }}
          className="z-20 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm transition-all hover:bg-zinc-800"
        >
          <Send className="size-4" />
          {text}
        </motion.button>
      ))}
    </div>
  );
};
