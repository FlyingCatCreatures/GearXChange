import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app.vue',
    './components/**/*.vue',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './plugins/**/*.ts',
    './server/api/**/*.ts',
    './server/lib/**/*.ts',
  ],
  theme: {
    extend: {
      keyframes: {
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.3s ease-out',
      },
    },
  },
}
export default config