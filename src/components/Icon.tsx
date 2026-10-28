const paths = {
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',
  download: 'M12 4v12m-5-5 5 5 5-5M4 17v3h16v-3',
  shuffle:
    'm17 3 4 4-4 4M3 7h3c5 0 7 10 12 10h3M17 13l4 4-4 4M3 17h3c2 0 3-2 5-5m3-3c1-1 2-2 4-2h3',
  reset: 'M3 10a9 9 0 1 1 1 7M3 4v6h6',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  compare: 'M12 3v18M8 5H4v14h4m8-14h4v14h-4',
  image: 'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M15 7h.01',
  check: 'm5 12 4 4L19 6',
} as const

export function Icon({ name, size = 18 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
